import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve static FFmpeg binary path
const FFMPEG_PATH: string = (() => {
  const staticPath = (ffmpegStatic as any)?.default || ffmpegStatic;
  if (typeof staticPath === 'string' && fs.existsSync(staticPath)) {
    try {
      fs.chmodSync(staticPath, 0o755);
    } catch {
      // ignore
    }
    return staticPath;
  }
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  return 'ffmpeg';
})();

// Resolve static ffprobe binary path for stream inspection
const FFPROBE_PATH: string = (() => {
  if (fs.existsSync('/usr/bin/ffprobe')) {
    return '/usr/bin/ffprobe';
  }
  return 'ffprobe';
})();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Setup directories
const TEMP_DIR = path.join(__dirname, 'tmp_conversions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Store download cache: token -> { filePath, fileName, fileSize, mimeType, createdAt }
interface ConvertedFileInfo {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
}
const convertedFiles = new Map<string, ConvertedFileInfo>();

// In-memory job tracker for asynchronous background conversion (Prevents Cloudflare 524 timeouts)
interface ConversionJob {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  stage: string;
  originalName: string;
  targetFormat: string;
  downloadToken?: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
  details?: string;
  createdAt: number;
  completedAt?: number;
}
const conversionJobs = new Map<string, ConversionJob>();

// Periodically clean up temp files and jobs older than 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, info] of convertedFiles.entries()) {
    if (now - info.createdAt > 30 * 60 * 1000) {
      try {
        if (fs.existsSync(info.filePath)) {
          fs.unlinkSync(info.filePath);
        }
      } catch (err) {
        console.error('Failed to remove old file:', err);
      }
      convertedFiles.delete(token);
    }
  }

  for (const [jobId, job] of conversionJobs.entries()) {
    if (now - job.createdAt > 30 * 60 * 1000) {
      conversionJobs.delete(jobId);
    }
  }
}, 5 * 60 * 1000);

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB limit
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Run FFmpeg command safely with multi-threading and progress streaming
function runFFmpeg(args: string[], onProgressChunk?: (chunk: string) => void): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // Automatically enable full multi-threading to finish transcoding rapidly before any gateway timeout
    const finalArgs = args.includes('-threads') ? args : ['-threads', '0', ...args];
    const ffmpegProc = spawn(FFMPEG_PATH, finalArgs);
    let stdout = '';
    let stderr = '';

    ffmpegProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    ffmpegProc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (onProgressChunk) {
        try {
          onProgressChunk(text);
        } catch {}
      }
    });

    ffmpegProc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        console.error('FFmpeg error details:', stderr);
        reject(new Error(`FFmpeg error (code ${code}): ${stderr.slice(-300)}`));
      }
    });

    ffmpegProc.on('error', (err) => {
      reject(err);
    });

    // Timeout after 3 minutes for heavy tasks
    setTimeout(() => {
      try {
        ffmpegProc.kill('SIGKILL');
      } catch {
        // ignore
      }
      reject(new Error('Conversion timed out after 180 seconds'));
    }, 180000);
  });
}

// Helper: Determine MIME types
function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.flv': 'video/x-flv',
    '.gif': 'image/gif',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.opus': 'audio/opus',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.ico': 'image/x-icon',
    '.avif': 'image/avif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

// Health & System Info API
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const { stdout, stderr } = await runFFmpeg(['-version']);
    const firstLine = (stdout || stderr || '').split('\n')[0] || 'FFmpeg available';
    res.json({
      status: 'ok',
      engine: 'FFmpeg',
      binaryPath: FFMPEG_PATH,
      version: firstLine,
      maxUploadMb: 150,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.json({
      status: 'degraded',
      engine: 'FFmpeg',
      error: err.message,
    });
  }
});

// Parameters for internal conversion executor
interface ConversionOptions {
  filePath: string;
  originalName: string;
  mimeType?: string;
  targetFormat: string;
  category?: string;
  resolution?: string;
  quality?: string;
  bitrate?: string;
  sampleRate?: string;
  grayscale?: string | boolean;
  muteAudio?: string | boolean;
  speed?: string;
  onProgress?: (progress: number, stage: string) => void;
}

interface ConversionResult {
  downloadToken: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
  targetFormat: string;
}

// Media inspection helper to verify video/audio streams and odd/even dimensions
interface MediaProbeInfo {
  hasVideo: boolean;
  hasAudio: boolean;
  width?: number;
  height?: number;
  duration?: number;
  videoCodec?: string;
  audioCodec?: string;
}

function probeMedia(filePath: string): Promise<MediaProbeInfo> {
  return new Promise((resolve) => {
    const proc = spawn(FFPROBE_PATH, [
      '-v', 'error',
      '-show_entries', 'stream=codec_type,codec_name,width,height:format=duration',
      '-of', 'json',
      filePath,
    ]);

    let output = '';
    proc.stdout.on('data', (d) => { output += d.toString(); });
    proc.on('close', () => {
      try {
        const parsed = JSON.parse(output);
        const streams = parsed.streams || [];
        const videoStream = streams.find((s: any) => s.codec_type === 'video');
        const audioStream = streams.find((s: any) => s.codec_type === 'audio');
        const duration = parseFloat(parsed.format?.duration || '0') || 0;

        resolve({
          hasVideo: Boolean(videoStream),
          hasAudio: Boolean(audioStream),
          width: videoStream?.width ? parseInt(videoStream.width, 10) : undefined,
          height: videoStream?.height ? parseInt(videoStream.height, 10) : undefined,
          videoCodec: videoStream?.codec_name,
          audioCodec: audioStream?.codec_name,
          duration,
        });
      } catch {
        resolve({
          hasVideo: true,
          hasAudio: true,
        });
      }
    });
    proc.on('error', () => {
      resolve({ hasVideo: true, hasAudio: true });
    });

    // 5-second safeguard timeout
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve({ hasVideo: true, hasAudio: true });
    }, 5000);
  });
}

// Core Conversion Engine: processes files rapidly with multi-threading
async function executeConversion(options: ConversionOptions): Promise<ConversionResult> {
  const {
    filePath,
    originalName,
    mimeType: initialMimeType,
    targetFormat,
    category,
    resolution,
    quality,
    bitrate,
    sampleRate,
    grayscale,
    muteAudio,
    speed,
    onProgress,
  } = options;

  const baseName = path.basename(originalName, path.extname(originalName));
  const safeTargetFormat = targetFormat.toLowerCase().replace(/[^a-z0-9]/g, '');
  const outExtension = `.${safeTargetFormat}`;
  const outFileName = `${baseName}_converted_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${outExtension}`;
  const outFilePath = path.join(TEMP_DIR, outFileName);

  const cleanupInput = () => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Failed to cleanup input:', e);
    }
  };

  try {
    const inputExt = path.extname(originalName).toLowerCase().replace('.', '');
    const isImageInput = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'ico', 'avif', 'heic', 'svg'].includes(inputExt) ||
      Boolean(initialMimeType && initialMimeType.startsWith('image/'));

    onProgress?.(20, 'Menganalisis format & buffer file...');

    // ==========================================
    // 1. IMAGE TO PDF CONVERSION (100% RELIABLE)
    // ==========================================
    if (isImageInput && safeTargetFormat === 'pdf') {
      onProgress?.(35, 'Menyusun dokumen PDF...');
      const pdfDoc = await PDFDocument.create();
      let pdfImage: any = null;

      // 1. Fast direct embedding for JPG or PNG
      const fileBytes = fs.readFileSync(filePath);
      if (['jpg', 'jpeg'].includes(inputExt)) {
        try {
          pdfImage = await pdfDoc.embedJpg(fileBytes);
        } catch {
          // Fall through to FFmpeg normalize
        }
      } else if (inputExt === 'png') {
        try {
          pdfImage = await pdfDoc.embedPng(fileBytes);
        } catch {
          // Fall through to FFmpeg normalize
        }
      }

      // 2. Transcode to high-quality baseline JPEG via FFmpeg if direct embed was not possible
      if (!pdfImage) {
        onProgress?.(50, 'Menyesuaikan format gambar untuk PDF...');
        const cleanJpgPath = path.join(TEMP_DIR, `clean_jpg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`);
        try {
          await runFFmpeg([
            '-y',
            '-i', filePath,
            '-frames:v', '1',
            '-pix_fmt', 'yuvj420p',
            '-q:v', '2',
            cleanJpgPath,
          ]);
          const jpgBytes = fs.readFileSync(cleanJpgPath);
          pdfImage = await pdfDoc.embedJpg(jpgBytes);
        } catch {
          // 3. Fallback: Transcode to RGBA PNG via FFmpeg
          const cleanPngPath = path.join(TEMP_DIR, `clean_png_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.png`);
          try {
            await runFFmpeg([
              '-y',
              '-i', filePath,
              '-frames:v', '1',
              '-pix_fmt', 'rgba',
              '-vcodec', 'png',
              cleanPngPath,
            ]);
            const pngBytes = fs.readFileSync(cleanPngPath);
            pdfImage = await pdfDoc.embedPng(pngBytes);
          } finally {
            try { if (fs.existsSync(cleanPngPath)) fs.unlinkSync(cleanPngPath); } catch {}
          }
        } finally {
          try { if (fs.existsSync(cleanJpgPath)) fs.unlinkSync(cleanJpgPath); } catch {}
        }
      }

      if (!pdfImage) {
        throw new Error('Gagal memproses gambar ke dalam dokumen PDF');
      }

      onProgress?.(75, 'Membuat halaman PDF...');
      const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
      });

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outFilePath, pdfBytes);
    }
    // ==========================================
    // 2. DOCUMENT / TEXT / DATA CONVERSIONS
    // ==========================================
    else if (category === 'document' || ['pdf', 'txt', 'html', 'json', 'csv', 'md'].includes(safeTargetFormat)) {
      onProgress?.(40, 'Memproses teks & struktur dokumen...');
      // Text / Markdown / Code to PDF
      if (['txt', 'md', 'json', 'csv'].includes(inputExt) && safeTargetFormat === 'pdf') {
        const textContent = fs.readFileSync(filePath, 'utf8');
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 10.5;
        const margin = 48;
        const pageWidth = 595.28; // A4 width
        const pageHeight = 841.89; // A4 height
        const usableWidth = pageWidth - margin * 2;
        const lineHeight = 14;

        const rawLines = textContent.split(/\r?\n/);
        const wrappedLines: string[] = [];

        for (const line of rawLines) {
          if (!line) {
            wrappedLines.push('');
            continue;
          }
          const words = line.split(' ');
          let currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (textWidth > usableWidth) {
              if (currentLine) wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) wrappedLines.push(currentLine);
        }

        const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
        let currentLineIdx = 0;

        while (currentLineIdx < wrappedLines.length || wrappedLines.length === 0) {
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          let y = pageHeight - margin;

          const slice = wrappedLines.slice(currentLineIdx, currentLineIdx + linesPerPage);
          for (const l of slice) {
            const safeLine = l.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
            page.drawText(safeLine, {
              x: margin,
              y: y - fontSize,
              size: fontSize,
              font,
              color: rgb(0.12, 0.12, 0.15),
            });
            y -= lineHeight;
          }

          currentLineIdx += linesPerPage;
          if (wrappedLines.length === 0) break;
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outFilePath, pdfBytes);
      }
      // PDF to TXT
      else if (inputExt === 'pdf' && safeTargetFormat === 'txt') {
        const pdfBytes = fs.readFileSync(filePath);
        const pdfString = pdfBytes.toString('binary');
        const textMatches = pdfString.match(/\(([^()]{1,500})\)\s*T[jd]/g);
        if (textMatches && textMatches.length > 0) {
          const extracted = textMatches
            .map((m) => m.replace(/^[^(]*\(/, '').replace(/\)\s*T[jd]$/, ''))
            .join(' ')
            .replace(/\\([()\\])/g, '$1');
          fs.writeFileSync(outFilePath, extracted || 'No readable text content found in PDF.', 'utf8');
        } else {
          fs.writeFileSync(outFilePath, 'DriaConvert: No plain text layer could be extracted from this PDF document.', 'utf8');
        }
      }
      // CSV to JSON
      else if (inputExt === 'csv' && safeTargetFormat === 'json') {
        const rawCsv = fs.readFileSync(filePath, 'utf8');
        const lines = rawCsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
          const records = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => {
              obj[h || `col_${i + 1}`] = values[i] ?? '';
            });
            return obj;
          });
          fs.writeFileSync(outFilePath, JSON.stringify(records, null, 2), 'utf8');
        } else {
          fs.writeFileSync(outFilePath, '[]', 'utf8');
        }
      }
      // JSON to CSV
      else if (inputExt === 'json' && safeTargetFormat === 'csv') {
        const rawJson = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawJson);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        if (items.length > 0 && typeof items[0] === 'object' && items[0] !== null) {
          const headers = Object.keys(items[0]);
          const csvLines = [headers.join(',')];
          for (const item of items) {
            const row = headers.map((h) => {
              const val = String(item[h] ?? '').replace(/"/g, '""');
              return `"${val}"`;
            });
            csvLines.push(row.join(','));
          }
          fs.writeFileSync(outFilePath, csvLines.join('\n'), 'utf8');
        } else {
          fs.writeFileSync(outFilePath, 'value\n' + JSON.stringify(parsed), 'utf8');
        }
      }
      // Markdown / Text to HTML
      else if ((inputExt === 'md' || inputExt === 'txt') && safeTargetFormat === 'html') {
        const content = fs.readFileSync(filePath, 'utf8');
        const safeTitle = baseName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; background: #ffffff; }
    pre { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 14px; }
  </style>
</head>
<body>
  <h2>${safeTitle}</h2>
  <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
        fs.writeFileSync(outFilePath, html, 'utf8');
      }
      // HTML to TXT
      else if (inputExt === 'html' && safeTargetFormat === 'txt') {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const plainText = htmlContent
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();
        fs.writeFileSync(outFilePath, plainText, 'utf8');
      }
      // Plain text extracts or other text formats
      else {
        const content = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(outFilePath, content, 'utf8');
      }
    }
    // ==========================================
    // 3. MULTIMEDIA CONVERSIONS (FFMPEG ENGINE)
    // ==========================================
    else {
      onProgress?.(30, 'Menganalisis stream audio & video...');
      const probe = await probeMedia(filePath);

      onProgress?.(45, 'Menyiapkan parameter transcode FFmpeg...');

      const args: string[] = [
        '-y',
        '-fflags', '+genpts+discardcorrupt',
        '-avoid_negative_ts', 'make_zero',
        '-i', filePath,
      ];

      const isTargetVideo = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv'].includes(safeTargetFormat);
      const isTargetAudio = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'opus'].includes(safeTargetFormat);

      // Video Category OR target is a Video container format OR input has video stream
      if (category === 'video' || isTargetVideo || (probe.hasVideo && !isImageInput)) {
        // A. Video to Audio Extraction (e.g. user selected MP3/WAV/AAC from video)
        if (isTargetAudio) {
          if (probe.hasAudio) {
            args.push('-vn', '-map', '0:a:0?');
            if (bitrate) args.push('-b:a', bitrate);
            else args.push('-b:a', '192k');

            if (sampleRate && sampleRate !== 'auto') {
              args.push('-ar', sampleRate);
            }

            if (safeTargetFormat === 'mp3') args.push('-c:a', 'libmp3lame');
            else if (safeTargetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
            else if (safeTargetFormat === 'flac') args.push('-c:a', 'flac');
            else if (safeTargetFormat === 'aac' || safeTargetFormat === 'm4a') args.push('-c:a', 'aac');
            else if (safeTargetFormat === 'ogg') args.push('-c:a', 'libvorbis');
            else if (safeTargetFormat === 'opus') args.push('-c:a', 'libopus');
          } else {
            // Video has no audio track: synthesize silent audio track matching video duration
            const dur = Math.max(1, Math.round(probe.duration || 5));
            args.length = 0;
            args.push(
              '-y',
              '-f', 'lavfi',
              '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
              '-t', dur.toString()
            );
            if (safeTargetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', '192k');
            else if (safeTargetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
            else if (safeTargetFormat === 'flac') args.push('-c:a', 'flac');
            else if (safeTargetFormat === 'aac' || safeTargetFormat === 'm4a') args.push('-c:a', 'aac', '-b:a', '192k');
            else if (safeTargetFormat === 'ogg') args.push('-c:a', 'libvorbis');
            else if (safeTargetFormat === 'opus') args.push('-c:a', 'libopus');
          }
        }
        // B. Video to Animated GIF
        else if (safeTargetFormat === 'gif') {
          args.push(
            '-t', '15',
            '-vf', 'fps=10,scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos,scale=\'min(480,iw)\':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3'
          );
        }
        // C. Video to Video Transcoding (MP4, WEBM, MKV, AVI, MOV, FLV)
        else {
          const userMuted = muteAudio === 'true' || muteAudio === true;

          // 1. Video Filters: CRITICAL to enforce even dimensions for libx264/yuv420p!
          const videoFilters: string[] = [];
          if (resolution && resolution !== 'original') {
            if (resolution === '1080p') videoFilters.push('scale=-2:1080');
            else if (resolution === '720p') videoFilters.push('scale=-2:720');
            else if (resolution === '480p') videoFilters.push('scale=-2:480');
            else if (resolution === '360p') videoFilters.push('scale=-2:360');
          } else {
            // ALWAYS enforce even dimensions to prevent "width not divisible by 2" failure!
            videoFilters.push('scale=trunc(iw/2)*2:trunc(ih/2)*2');
          }

          if (grayscale === 'true' || grayscale === true) {
            videoFilters.push('hue=s=0');
          }

          if (speed && speed !== '1') {
            const s = parseFloat(speed);
            if (!isNaN(s) && s >= 0.25 && s <= 4) {
              videoFilters.push(`setpts=${1 / s}*PTS`);
            }
          }

          if (videoFilters.length > 0) {
            args.push('-vf', videoFilters.join(','));
          }

          // 2. Stream Mapping: Map primary video track
          args.push('-map', '0:v:0?');

          // Handle audio mapping
          if (userMuted || !probe.hasAudio) {
            args.push('-an');
          } else {
            args.push('-map', '0:a:0?');
          }

          // 3. Optimized Encoders per target container
          if (safeTargetFormat === 'mp4') {
            args.push('-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p');
            if (quality === 'high') args.push('-crf', '20');
            else if (quality === 'low') args.push('-crf', '28');
            else args.push('-crf', '23');

            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'aac', '-b:a', '192k', '-ac', '2');
            }
            args.push('-movflags', '+faststart', '-max_muxing_queue_size', '1024');
          } else if (safeTargetFormat === 'webm') {
            args.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '6', '-row-mt', '1', '-b:v', '0', '-crf', '32');
            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'libopus', '-b:a', '128k', '-ac', '2');
            }
            args.push('-max_muxing_queue_size', '1024');
          } else if (safeTargetFormat === 'mkv') {
            args.push('-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p');
            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'aac', '-b:a', '192k', '-ac', '2');
            }
            args.push('-max_muxing_queue_size', '1024');
          } else if (safeTargetFormat === 'mov') {
            args.push('-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p');
            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'aac', '-b:a', '192k', '-ac', '2');
            }
            args.push('-movflags', '+faststart', '-max_muxing_queue_size', '1024');
          } else if (safeTargetFormat === 'avi') {
            args.push('-c:v', 'mpeg4', '-q:v', '3');
            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'libmp3lame', '-b:a', '192k', '-ac', '2');
            }
            args.push('-max_muxing_queue_size', '1024');
          } else if (safeTargetFormat === 'flv') {
            args.push('-c:v', 'flv');
            if (!userMuted && probe.hasAudio) {
              args.push('-c:a', 'mp3', '-b:a', '128k', '-ar', '44100', '-ac', '2');
            }
            args.push('-max_muxing_queue_size', '1024');
          }
        }
      }
      // Audio Conversions
      else if (category === 'audio' || isTargetAudio) {
        args.push('-vn');

        if (bitrate) {
          args.push('-b:a', bitrate);
        } else {
          args.push('-b:a', '192k');
        }

        if (sampleRate && sampleRate !== 'auto') {
          args.push('-ar', sampleRate);
        }

        if (safeTargetFormat === 'mp3') {
          args.push('-c:a', 'libmp3lame');
        } else if (safeTargetFormat === 'wav') {
          args.push('-c:a', 'pcm_s16le');
        } else if (safeTargetFormat === 'flac') {
          args.push('-c:a', 'flac');
        } else if (safeTargetFormat === 'aac' || safeTargetFormat === 'm4a') {
          args.push('-c:a', 'aac');
        } else if (safeTargetFormat === 'ogg') {
          args.push('-c:a', 'libvorbis');
        } else if (safeTargetFormat === 'opus') {
          args.push('-c:a', 'libopus');
        }
      }
      // Image to Image Conversions (PNG, JPG, WEBP, GIF, BMP, TIFF, ICO, AVIF)
      else if (category === 'image' || isImageInput) {
        args.push('-frames:v', '1', '-update', '1');

        const imgFilters: string[] = [];
        if (resolution && resolution !== 'original') {
          if (resolution === '1920') imgFilters.push('scale=1920:-2');
          else if (resolution === '1280') imgFilters.push('scale=1280:-2');
          else if (resolution === '800') imgFilters.push('scale=800:-2');
          else if (resolution === '500') imgFilters.push('scale=500:-2');
          else if (resolution === 'icon') imgFilters.push('scale=128:128');
        }

        if (grayscale === 'true' || grayscale === true) {
          imgFilters.push('format=gray');
        }

        if (safeTargetFormat === 'ico') {
          imgFilters.push('scale=64:64');
        }

        if (imgFilters.length > 0) {
          args.push('-vf', imgFilters.join(','));
        }

        if (safeTargetFormat === 'jpg' || safeTargetFormat === 'jpeg') {
          args.push('-c:v', 'mjpeg', '-pix_fmt', 'yuvj420p');
          args.push('-q:v', quality === 'high' ? '2' : quality === 'low' ? '6' : '3');
        } else if (safeTargetFormat === 'png') {
          args.push('-c:v', 'png');
        } else if (safeTargetFormat === 'webp') {
          args.push('-c:v', 'libwebp', '-quality', quality === 'high' ? '92' : quality === 'low' ? '65' : '82');
        } else if (safeTargetFormat === 'bmp') {
          args.push('-c:v', 'bmp');
        } else if (safeTargetFormat === 'tiff') {
          args.push('-c:v', 'tiff');
        } else if (safeTargetFormat === 'avif') {
          args.push('-c:v', 'libaom-av1', '-still-picture', '1', '-cpu-used', '6');
        }
      }

      args.push(outFilePath);
      onProgress?.(55, 'FFmpeg: Transcoding media berkecepatan tinggi...');
      await runFFmpeg(args, (chunk) => {
        if (chunk.includes('time=')) {
          onProgress?.(75, 'FFmpeg: Mengolah frame & stream...');
        }
      });
    }

    onProgress?.(90, 'Memverifikasi hasil konversi...');

    // Verify output exists and has size
    if (!fs.existsSync(outFilePath)) {
      throw new Error('Converted output file was not generated');
    }

    const stat = fs.statSync(outFilePath);
    if (stat.size === 0) {
      throw new Error('Converted output file is empty (0 bytes)');
    }

    // Generate token and cache file
    const downloadToken = crypto.randomBytes(16).toString('hex');
    const finalDownloadName = `${baseName}.${safeTargetFormat}`;
    const mimeType = getMimeType(outExtension);

    convertedFiles.set(downloadToken, {
      filePath: outFilePath,
      fileName: finalDownloadName,
      fileSize: stat.size,
      mimeType,
      createdAt: Date.now(),
    });

    cleanupInput();
    onProgress?.(100, 'Konversi berhasil diselesaikan!');

    return {
      downloadToken,
      downloadUrl: `/api/download/${downloadToken}`,
      fileName: finalDownloadName,
      fileSize: stat.size,
      mimeType,
      originalName,
      targetFormat: safeTargetFormat.toUpperCase(),
    };
  } catch (err: any) {
    cleanupInput();
    try {
      if (fs.existsSync(outFilePath)) {
        fs.unlinkSync(outFilePath);
      }
    } catch {}
    throw err;
  }
}

// 1. Asynchronous Conversion Endpoint: Starts background job & responds immediately (No 524 timeouts)
app.post('/api/convert-async', upload.single('file') as any, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  const {
    targetFormat,
    category,
    resolution,
    quality,
    bitrate,
    sampleRate,
    grayscale,
    muteAudio,
    speed,
  } = req.body;

  if (!targetFormat) {
    try { fs.unlinkSync(file.path); } catch {}
    res.status(400).json({ success: false, error: 'Target format is required' });
    return;
  }

  const safeTargetFormat = targetFormat.toLowerCase().replace(/[^a-z0-9]/g, '');
  const jobId = `job_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

  const job: ConversionJob = {
    id: jobId,
    status: 'processing',
    progress: 15,
    stage: 'File diterima, memulai transcode server...',
    originalName: file.originalname,
    targetFormat: safeTargetFormat.toUpperCase(),
    createdAt: Date.now(),
  };

  conversionJobs.set(jobId, job);

  // Return HTTP 200 immediately to client (<100ms) - completely eliminates Cloudflare 100s timeout!
  res.json({
    success: true,
    jobId,
    status: 'processing',
    message: 'Conversion job initiated successfully',
  });

  // Launch background conversion asynchronously
  (async () => {
    try {
      const result = await executeConversion({
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        targetFormat: safeTargetFormat,
        category,
        resolution,
        quality,
        bitrate,
        sampleRate,
        grayscale,
        muteAudio,
        speed,
        onProgress: (p, stage) => {
          job.progress = p;
          job.stage = stage;
        },
      });

      job.status = 'completed';
      job.progress = 100;
      job.stage = 'Konversi selesai!';
      job.downloadToken = result.downloadToken;
      job.downloadUrl = result.downloadUrl;
      job.fileName = result.fileName;
      job.fileSize = result.fileSize;
      job.mimeType = result.mimeType;
      job.completedAt = Date.now();
    } catch (err: any) {
      console.error(`Conversion job ${jobId} failed:`, err);
      job.status = 'error';
      job.error = err.message || 'Conversion failed';
      job.details = err.message || 'Unknown processing error';
      job.completedAt = Date.now();
    }
  })();
});

// 2. Job Status Polling Endpoint (Lightning fast ~10ms per poll)
app.get('/api/convert/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = conversionJobs.get(jobId);
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found or expired' });
    return;
  }

  res.json({
    success: true,
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    originalName: job.originalName,
    targetFormat: job.targetFormat,
    downloadToken: job.downloadToken,
    downloadUrl: job.downloadUrl,
    fileName: job.fileName,
    fileSize: job.fileSize,
    mimeType: job.mimeType,
    error: job.error,
    details: job.details,
  });
});

// 3. Synchronous / Legacy Conversion Endpoint (kept for backwards-compatibility or small requests)
app.post('/api/convert', upload.single('file') as any, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  const {
    targetFormat,
    category,
    resolution,
    quality,
    bitrate,
    sampleRate,
    grayscale,
    muteAudio,
    speed,
    mode,
    async: isAsyncParam,
  } = req.body;

  if (!targetFormat) {
    try { fs.unlinkSync(file.path); } catch {}
    res.status(400).json({ success: false, error: 'Target format is required' });
    return;
  }

  // If async requested, route to async logic
  if (req.query.mode === 'async' || mode === 'async' || isAsyncParam === 'true' || req.query.async === 'true') {
    const safeTargetFormat = targetFormat.toLowerCase().replace(/[^a-z0-9]/g, '');
    const jobId = `job_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    const job: ConversionJob = {
      id: jobId,
      status: 'processing',
      progress: 15,
      stage: 'File diterima, memulai transcode server...',
      originalName: file.originalname,
      targetFormat: safeTargetFormat.toUpperCase(),
      createdAt: Date.now(),
    };
    conversionJobs.set(jobId, job);

    res.json({
      success: true,
      jobId,
      status: 'processing',
      message: 'Conversion job initiated successfully',
    });

    (async () => {
      try {
        const result = await executeConversion({
          filePath: file.path,
          originalName: file.originalname,
          mimeType: file.mimetype,
          targetFormat: safeTargetFormat,
          category,
          resolution,
          quality,
          bitrate,
          sampleRate,
          grayscale,
          muteAudio,
          speed,
          onProgress: (p, stage) => {
            job.progress = p;
            job.stage = stage;
          },
        });
        job.status = 'completed';
        job.progress = 100;
        job.stage = 'Konversi selesai!';
        job.downloadToken = result.downloadToken;
        job.downloadUrl = result.downloadUrl;
        job.fileName = result.fileName;
        job.fileSize = result.fileSize;
        job.mimeType = result.mimeType;
        job.completedAt = Date.now();
      } catch (err: any) {
        console.error(`Conversion job ${jobId} failed:`, err);
        job.status = 'error';
        job.error = err.message || 'Conversion failed';
        job.details = err.message || 'Unknown processing error';
        job.completedAt = Date.now();
      }
    })();
    return;
  }

  try {
    const result = await executeConversion({
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
      targetFormat,
      category,
      resolution,
      quality,
      bitrate,
      sampleRate,
      grayscale,
      muteAudio,
      speed,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Conversion failed:', err);
    res.status(500).json({
      success: false,
      error: 'Conversion failed',
      details: err.message || 'Unknown processing error',
    });
  }
});

// Download endpoint
app.get('/api/download/:token', (req: Request, res: Response): void => {
  const { token } = req.params;
  const fileInfo = convertedFiles.get(token);

  if (!fileInfo || !fs.existsSync(fileInfo.filePath)) {
    res.status(404).json({ success: false, error: 'File not found or expired' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.fileName)}"`);
  res.setHeader('Content-Type', fileInfo.mimeType);
  res.setHeader('Content-Length', fileInfo.fileSize);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const readStream = fs.createReadStream(fileInfo.filePath);
  readStream.pipe(res);
});

// Available formats and metadata API
app.get('/api/formats', (_req: Request, res: Response) => {
  res.json({
    categories: [
      {
        id: 'video',
        name: 'Video Converter',
        supportedInputs: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', 'ts', '3gp', 'gif'],
        targetFormats: ['MP4', 'WEBM', 'MKV', 'AVI', 'MOV', 'GIF', 'FLV', 'MP3', 'WAV', 'AAC'],
        options: ['resolution', 'quality', 'muteAudio', 'speed'],
      },
      {
        id: 'audio',
        name: 'Audio Converter',
        supportedInputs: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'opus', 'wma', 'aiff'],
        targetFormats: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A', 'OPUS'],
        options: ['bitrate', 'sampleRate'],
      },
      {
        id: 'image',
        name: 'Image Converter',
        supportedInputs: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'avif'],
        targetFormats: ['PNG', 'JPG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'ICO', 'PDF', 'AVIF'],
        options: ['quality', 'resolution', 'grayscale'],
      },
      {
        id: 'document',
        name: 'Document / File Converter',
        supportedInputs: ['pdf', 'txt', 'md', 'json', 'csv', 'html', 'png', 'jpg', 'webp'],
        targetFormats: ['PDF', 'TXT', 'HTML', 'JSON', 'CSV'],
        options: [],
      },
    ],
  });
});

// Explicit SEO Crawler Routes: Robots.txt & Sitemap.xml
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    return res.sendFile(robotsPath);
  }
  res.send(`User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Googlebot-Image\nAllow: /\n\nSitemap: https://convert.driacom.com/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    return res.sendFile(sitemapPath);
  }
  res.status(404).send('Not Found');
});

// Explicit 404 for API routes - prevents falling through to Vite index.html
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Global Express & Multer error handler - ALWAYS returns clean JSON
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express Server Error:', err);
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    success: false,
    error: err.name === 'MulterError' ? `Upload Error: ${err.message}` : (err.message || 'Internal Server Error'),
    details: err.details || err.message || 'Unknown server error',
  });
});

// Setup Vite in development or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DriaConvert server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
