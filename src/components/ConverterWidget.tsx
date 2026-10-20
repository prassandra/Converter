import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Settings2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Archive,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import JSZip from 'jszip';
import { ConverterCategory, FileItem, Language, AdvancedOptions } from '../types';
import { translations } from '../translations';
import { ConversionProgressBar } from './ConversionProgressBar';
import { MismatchModal } from './MismatchModal';
import { AdSlot } from './AdSlot';

interface ConverterWidgetProps {
  lang: Language;
  activeCategory: ConverterCategory;
  onSelectCategory: (cat: ConverterCategory) => void;
  presetTargetFormat?: string;
}

export const ConverterWidget: React.FC<ConverterWidgetProps> = ({
  lang,
  activeCategory,
  onSelectCategory,
  presetTargetFormat,
}) => {
  const t = translations[lang].converter;
  const tTabs = translations[lang].tabs;
  const isId = lang === 'id';

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [globalConverting, setGlobalConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [expandedSettingsId, setExpandedSettingsId] = useState<string | null>(null);

  // Global batch target format for the entire queue
  const [batchTargetFormat, setBatchTargetFormat] = useState<string>('');

  // Batch mismatch modal info
  const [mismatchInfo, setMismatchInfo] = useState<{
    files: File[];
    detectedCategory: ConverterCategory;
    mismatchCount: number;
    matchedCount: number;
  } | null>(null);

  // Toast notification for mixed drops
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 6000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target formats by category
  const targetFormatsMap: Record<ConverterCategory, string[]> = {
    video: ['MP4', 'WEBM', 'MKV', 'AVI', 'MOV', 'GIF', 'FLV', 'MP3', 'WAV', 'AAC'],
    audio: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A', 'OPUS'],
    image: ['WEBP', 'PNG', 'JPG', 'GIF', 'BMP', 'TIFF', 'ICO', 'PDF', 'AVIF'],
    document: ['PDF', 'TXT', 'HTML', 'JSON', 'CSV'],
  };

  // Sync batch target format when category changes or preset changes
  useEffect(() => {
    if (presetTargetFormat) {
      setBatchTargetFormat(presetTargetFormat);
    } else {
      const defaultTargets: Record<ConverterCategory, string> = {
        video: 'MP4',
        audio: 'MP3',
        image: 'WEBP',
        document: 'PDF',
      };
      setBatchTargetFormat(defaultTargets[activeCategory] || 'MP4');
    }
  }, [activeCategory, presetTargetFormat]);

  // Helper: detect file category from name/mime
  const detectCategory = (filename: string, mime: string): ConverterCategory => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'ts'].includes(ext) || mime.startsWith('video/')) {
      return 'video';
    }
    if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'opus', 'wma', 'aiff'].includes(ext) || mime.startsWith('audio/')) {
      return 'audio';
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif', 'ico', 'avif', 'svg', 'heic'].includes(ext) || mime.startsWith('image/')) {
      return 'image';
    }
    return 'document';
  };

  // Create single FileItem
  const createNewFileItem = (f: File, cat: ConverterCategory, targetFmt?: string): FileItem => {
    const target = targetFmt || batchTargetFormat || targetFormatsMap[cat][0];

    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      category: cat,
      targetFormat: target,
      options: {
        resolution: 'original',
        quality: 'medium',
        bitrate: '192k',
        sampleRate: '44100',
        speed: '1',
        grayscale: false,
        muteAudio: false,
      },
      status: 'idle',
      progress: 0,
    };
  };

  // Process incoming files (Drag-and-Drop or File Input)
  const handleFiles = (incomingFiles: FileList | File[]) => {
    const rawList = Array.from(incomingFiles);
    if (rawList.length === 0) return;

    // Filter oversized files (>150MB)
    const validSizeFiles: File[] = [];
    const oversizedFiles: string[] = [];

    rawList.forEach((f) => {
      if (f.size > 150 * 1024 * 1024) {
        oversizedFiles.push(f.name);
      } else {
        validSizeFiles.push(f);
      }
    });

    if (oversizedFiles.length > 0) {
      showToast(
        isId
          ? `${oversizedFiles.length} file melebihi batas 150MB dan dilewati: ${oversizedFiles.join(', ')}`
          : `${oversizedFiles.length} file(s) exceeded the 150MB limit: ${oversizedFiles.join(', ')}`
      );
    }

    if (validSizeFiles.length === 0) return;

    // Separate matching vs mismatching files
    const matchedFiles: File[] = [];
    const mismatchedFiles: File[] = [];
    let primaryMismatchedCategory: ConverterCategory = 'video';

    validSizeFiles.forEach((f) => {
      const detected = detectCategory(f.name, f.type);
      if (detected === activeCategory) {
        matchedFiles.push(f);
      } else {
        mismatchedFiles.push(f);
        primaryMismatchedCategory = detected;
      }
    });

    // Case 1: ALL files mismatched
    if (matchedFiles.length === 0 && mismatchedFiles.length > 0) {
      setMismatchInfo({
        files: mismatchedFiles,
        detectedCategory: primaryMismatchedCategory,
        mismatchCount: mismatchedFiles.length,
        matchedCount: 0,
      });
      return;
    }

    // Case 2: Mixed files (some matched, some mismatched)
    if (matchedFiles.length > 0 && mismatchedFiles.length > 0) {
      const addedItems = matchedFiles.map((f) => createNewFileItem(f, activeCategory, batchTargetFormat));
      setFiles((prev) => [...prev, ...addedItems]);

      setToastMessage(
        isId
          ? `${matchedFiles.length} file ${activeCategory} berhasil dimasukkan ke antrean. ${mismatchedFiles.length} file dilewati karena berbeda kategori.`
          : `${matchedFiles.length} ${activeCategory} files added to queue. ${mismatchedFiles.length} files skipped due to category mismatch.`
      );
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    // Case 3: ALL files matched! Add to batch queue
    const newItems = matchedFiles.map((f) => createNewFileItem(f, activeCategory, batchTargetFormat));
    setFiles((prev) => [...prev, ...newItems]);
  };

  // Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        handleFiles(e.clipboardData.files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeCategory, batchTargetFormat]);

  // Handle Switch Category from Mismatch Modal
  const handleMismatchSwitch = () => {
    if (mismatchInfo) {
      const { files: switchFiles, detectedCategory } = mismatchInfo;
      onSelectCategory(detectedCategory);
      const newItems = switchFiles.map((f) => createNewFileItem(f, detectedCategory));
      setFiles((prev) => [...prev, ...newItems]);
      setMismatchInfo(null);
    }
  };

  // Drag and Drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Change Target Format for ALL queued items in batch
  const handleBatchTargetChange = (newFormat: string) => {
    setBatchTargetFormat(newFormat);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'idle' || f.status === 'error'
          ? { ...f, targetFormat: newFormat, status: 'idle', downloadUrl: undefined, progress: 0 }
          : f
      )
    );
  };

  // Bulletproof Client-side fallback for Image to PDF conversion
  const clientImageToPdfFallback = async (file: File): Promise<{ blob: Blob; fileName: string; fileSize: number }> => {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    let pdfImage: any = null;

    const fileBytes = await file.arrayBuffer();
    const ext = file.name.split('.').pop()?.toLowerCase();

    // 1. Try direct embedding if already JPG or PNG
    if (ext === 'jpg' || ext === 'jpeg' || file.type === 'image/jpeg') {
      try {
        pdfImage = await pdfDoc.embedJpg(fileBytes);
      } catch {}
    } else if (ext === 'png' || file.type === 'image/png') {
      try {
        pdfImage = await pdfDoc.embedPng(fileBytes);
      } catch {}
    }

    // 2. If direct embed was not possible, decode and normalize via HTML5 Canvas
    if (!pdfImage) {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas render context not available');
      ctx.drawImage(bitmap, 0, 0);
      const jpegBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!jpegBlob) throw new Error('Failed to encode rasterized frame');
      const jpegBytes = await jpegBlob.arrayBuffer();
      pdfImage = await pdfDoc.embedJpg(jpegBytes);
    }

    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
    page.drawImage(pdfImage, {
      x: 0,
      y: 0,
      width: pdfImage.width,
      height: pdfImage.height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return {
      blob,
      fileName: `${baseName}.pdf`,
      fileSize: blob.size,
    };
  };

  // Convert single file via server FFmpeg with client-side fallback
  const convertSingleFile = async (item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? {
              ...f,
              status: 'converting',
              progress: 15,
              progressStage: isId ? 'Mengunggah file ke server...' : 'Uploading file...',
              errorMessage: undefined,
            }
          : f
      )
    );

    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('targetFormat', item.targetFormat);
    formData.append('category', item.category);

    if (item.options.resolution) formData.append('resolution', item.options.resolution);
    if (item.options.quality) formData.append('quality', item.options.quality);
    if (item.options.bitrate) formData.append('bitrate', item.options.bitrate);
    if (item.options.sampleRate) formData.append('sampleRate', item.options.sampleRate);
    if (item.options.grayscale) formData.append('grayscale', 'true');
    if (item.options.muteAudio) formData.append('muteAudio', 'true');
    if (item.options.speed) formData.append('speed', item.options.speed);

    // Start conversion lifecycle
    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? {
              ...f,
              status: 'converting',
              progress: 10,
              progressStage: isId ? 'Mengunggah file ke server...' : 'Uploading file...',
              errorMessage: undefined,
            }
          : f
      )
    );

    try {
      let data: any = null;
      let isFallback = false;

      try {
        // Attempt async job initiation first (prevents Cloudflare 524 timeouts)
        const asyncRes = await fetch('/api/convert-async', {
          method: 'POST',
          body: formData,
        });

        if (asyncRes.ok) {
          const initData = await asyncRes.json();
          if (initData.success && initData.jobId) {
            const jobId = initData.jobId;
            let completed = false;
            let attempts = 0;
            const maxAttempts = 180; // 3 minutes timeout

            while (!completed && attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              attempts++;

              try {
                const statusRes = await fetch(`/api/convert/status/${jobId}`);
                if (!statusRes.ok) continue;

                const job = await statusRes.json();
                if (!job.success) {
                  throw new Error(job.error || (isId ? 'Status pemrosesan gagal' : 'Processing status failed'));
                }

                if (job.status === 'processing') {
                  setFiles((prev) =>
                    prev.map((f) => {
                      if (f.id === item.id) {
                        return {
                          ...f,
                          progress: Math.max(f.progress, job.progress || 35),
                          progressStage: job.stage || (isId ? 'FFmpeg: Transcoding media...' : 'FFmpeg transcoding...'),
                        };
                      }
                      return f;
                    })
                  );
                } else if (job.status === 'completed') {
                  completed = true;
                  data = {
                    success: true,
                    downloadUrl: job.downloadUrl,
                    downloadToken: job.downloadToken,
                    fileName: job.fileName,
                    fileSize: job.fileSize,
                  };
                  break;
                } else if (job.status === 'error') {
                  completed = true;
                  throw new Error(job.details || job.error || (isId ? 'Konversi gagal di server' : 'Conversion failed'));
                }
              } catch (pollErr: any) {
                if (completed) break;
                // If it was our own thrown error from job.status === 'error', bubble it
                if (pollErr.message && !pollErr.message.includes('fetch')) {
                  throw pollErr;
                }
              }
            }

            if (!completed && !data) {
              throw new Error(
                isId
                  ? 'Waktu proses di server melebihi batas (Timeout). Silakan pilih resolusi lebih hemat atau potong durasi.'
                  : 'Server processing timed out. Please choose a lower resolution or trim duration.'
              );
            }
          }
        } else if (asyncRes.status === 524) {
          throw new Error(
            isId
              ? 'Server Timeout (524): Waktu pemrosesan melebihi batas gateway proxy. Silakan pilih opsi resolusi lebih rendah atau format MP4 cepat.'
              : 'Server Timeout (524): Processing exceeded gateway limit. Please choose lower resolution or fast MP4 format.'
          );
        } else {
          // If async endpoint failed for some reason, fallback to synchronous /api/convert
          const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData,
          });

          const responseText = await response.text();
          try {
            data = JSON.parse(responseText);
          } catch {
            if (item.targetFormat.toLowerCase() === 'pdf' && (item.category === 'image' || item.file.type.startsWith('image/'))) {
              isFallback = true;
            } else if (response.status === 524) {
              throw new Error(
                isId
                  ? 'Server Timeout (524): Koneksi terputus saat memproses file. Gunakan opsi kompresi/resolusi lebih rendah.'
                  : 'Server Timeout (524): Connection dropped during heavy processing. Try lowering resolution.'
              );
            } else {
              throw new Error(
                response.ok
                  ? (isId ? 'Format respons tidak valid dari server' : 'Invalid server response format')
                  : (isId ? `Gagal memproses file di server (Status: ${response.status})` : `Server conversion failed (Status: ${response.status})`)
              );
            }
          }

          if (data && (!response.ok || !data.success)) {
            if (item.targetFormat.toLowerCase() === 'pdf' && (item.category === 'image' || item.file.type.startsWith('image/'))) {
              isFallback = true;
            } else {
              throw new Error(data?.details || data?.error || (isId ? 'Konversi gagal diproses' : 'Server conversion failed'));
            }
          }
        }
      } catch (fetchErr: any) {
        if (item.targetFormat.toLowerCase() === 'pdf' && (item.category === 'image' || item.file.type.startsWith('image/'))) {
          isFallback = true;
        } else {
          throw fetchErr;
        }
      }

      if (isFallback) {
        const fallbackRes = await clientImageToPdfFallback(item.file);
        const blobUrl = window.URL.createObjectURL(fallbackRes.blob);
        data = {
          success: true,
          downloadUrl: blobUrl,
          fileName: fallbackRes.fileName,
          fileSize: fallbackRes.fileSize,
        };
      }

      if (!data || !data.success) {
        throw new Error(isId ? 'Konversi gagal diproses' : 'Server conversion failed');
      }

      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === item.id) {
            return {
              ...f,
              status: 'success',
              progress: 100,
              progressStage: isId ? 'Konversi Selesai!' : 'Conversion Complete!',
              downloadUrl: data.downloadUrl,
              downloadToken: data.downloadToken,
              outputName: data.fileName,
              outputSize: data.fileSize,
            };
          }
          return f;
        })
      );
    } catch (err: any) {
      const errMsg = err.message || (isId ? 'Terjadi kesalahan saat konversi' : 'Error occurred during conversion');
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === item.id) {
            return {
              ...f,
              status: 'error',
              progress: 0,
              errorMessage: errMsg,
            };
          }
          return f;
        })
      );
    }
  };

  // Convert all pending files sequentially
  const convertAllFiles = async () => {
    const pendingItems = files.filter((f) => f.status === 'idle' || f.status === 'error');
    if (pendingItems.length === 0) return;

    setGlobalConverting(true);
    for (const item of pendingItems) {
      await convertSingleFile(item);
    }
    setGlobalConverting(false);
  };

  // Download single file via Blob (safe for mobile iframe)
  const handleBlobDownload = async (item: FileItem) => {
    if (!item.downloadToken && !item.downloadUrl) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, downloading: true } : f))
    );

    // If local blob URL exists, trigger download directly
    if (item.downloadUrl?.startsWith('blob:')) {
      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = item.downloadUrl;
      downloadLink.download = item.outputName || item.name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
      }, 1500);
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, downloading: false } : f))
      );
      return;
    }

    const token = item.downloadToken || item.downloadUrl?.split('/').pop() || '';
    const endpoint = `/api/download/${token}`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('File not found or expired');

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.style.display = 'none';
      downloadLink.href = blobUrl;
      downloadLink.download = item.outputName || item.name;

      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch (err) {
      console.warn('Blob download failed, using direct link:', err);
      window.location.href = endpoint;
    } finally {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, downloading: false } : f))
      );
    }
  };

  // Download ALL completed files as a ZIP archive using JSZip
  const handleDownloadAllZip = async () => {
    const successItems = files.filter((f) => f.status === 'success' && (f.downloadToken || f.downloadUrl));
    if (successItems.length === 0) return;

    // If only 1 file, download directly
    if (successItems.length === 1) {
      await handleBlobDownload(successItems[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Fetch each converted file blob and add to ZIP
      for (const item of successItems) {
        let blob: Blob | null = null;
        if (item.downloadUrl?.startsWith('blob:')) {
          const res = await fetch(item.downloadUrl);
          if (res.ok) blob = await res.blob();
        } else {
          const token = item.downloadToken || item.downloadUrl?.split('/').pop() || '';
          const res = await fetch(`/api/download/${token}`);
          if (res.ok) blob = await res.blob();
        }
        if (blob) {
          const fileName = item.outputName || `${item.name.split('.')[0]}.${item.targetFormat.toLowerCase()}`;
          zip.file(fileName, blob);
        }
      }

      // Generate the ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);

      const zipDownloadLink = document.createElement('a');
      zipDownloadLink.style.display = 'none';
      zipDownloadLink.href = zipUrl;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      zipDownloadLink.download = `DriaConvert_Batch_${dateStr}.zip`;

      document.body.appendChild(zipDownloadLink);
      zipDownloadLink.click();

      setTimeout(() => {
        document.body.removeChild(zipDownloadLink);
        window.URL.revokeObjectURL(zipUrl);
      }, 2000);
    } catch (err) {
      console.error('Failed to create batch ZIP:', err);
      showToast(isId ? 'Gagal membuat arsip ZIP. Mengunduh file satu per satu.' : 'Failed to create ZIP. Downloading files sequentially.');
      for (const item of successItems) {
        await handleBlobDownload(item);
        await new Promise((r) => setTimeout(r, 600));
      }
    } finally {
      setIsZipping(false);
    }
  };

  // Remove single file
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Clear all queue
  const clearAllFiles = () => {
    setFiles([]);
    setExpandedSettingsId(null);
  };

  // Update single file target format
  const updateTargetFormat = (id: string, format: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, targetFormat: format, status: 'idle', downloadUrl: undefined, progress: 0 }
          : f
      )
    );
  };

  // Update single file advanced option
  const updateOption = (id: string, key: keyof AdvancedOptions, val: any) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              options: { ...f.options, [key]: val },
              status: 'idle',
              downloadUrl: undefined,
              progress: 0,
            }
          : f
      )
    );
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Total queue size
  const totalQueueSize = files.reduce((acc, f) => acc + f.size, 0);

  // Category Icon
  const getCategoryIcon = (cat: ConverterCategory) => {
    switch (cat) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const availableTargets = targetFormatsMap[activeCategory] || targetFormatsMap.video;
  const hasSuccessfulFiles = files.some((f) => f.status === 'success');
  const hasPendingFiles = files.some((f) => f.status === 'idle' || f.status === 'error');
  const successCount = files.filter((f) => f.status === 'success').length;

  return (
    <div className="w-full">
      {/* Category Segmented Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 mb-6 bg-slate-200/60 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        {(['video', 'audio', 'image', 'document'] as ConverterCategory[]).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer truncate ${
                isActive
                  ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-500 text-indigo-600 dark:text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/[0.03]'
              }`}
            >
              {getCategoryIcon(cat)}
              <span className="capitalize truncate">{tTabs[cat]}</span>
            </button>
          );
        })}
      </div>

      {/* Toast Notification (Mixed Drop Notification) */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold text-indigo-600 hover:underline ml-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative rounded-3xl border-2 transition-all duration-300 p-6 sm:p-10 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 scale-[1.01] shadow-2xl ring-4 ring-indigo-500/25'
            : 'border-dashed border-slate-300/90 dark:border-white/[0.12] hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-white/95 dark:bg-[#0B0F19]/90 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Dragging Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-indigo-600/95 text-white rounded-3xl backdrop-blur-xs animate-in fade-in duration-150">
            <UploadCloud className="w-14 h-14 animate-bounce mb-2" />
            <h4 className="text-lg sm:text-xl font-black">{t.dropActive}</h4>
            <p className="text-xs text-indigo-100 mt-1">
              {isId ? `Multi-file batch ${activeCategory.toUpperCase()}` : `Batch multi-file upload for ${activeCategory.toUpperCase()}`}
            </p>
          </div>
        )}

        {files.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-6 sm:py-9">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-3xl bg-gradient-to-tr from-indigo-500/15 via-indigo-500/10 to-blue-500/15 border border-indigo-500/25 dark:border-indigo-500/35 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/15">
              <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {translations[lang].hero.selectFiles}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
              {translations[lang].hero.orDrop} <br />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({t.dropHint})
              </span>
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.99] transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5 shrink-0" />
              <span>{t.selectFilesBtn} (Multi-file)</span>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
            </button>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 block">
              {isId ? 'Maks. 150MB per file · Otomatis dihapus dalam 30 menit' : 'Max 150MB per file · Auto-deleted in 30 mins'}
            </span>
          </div>
        ) : (
          /* Queue Management Interface */
          <div className="space-y-4 text-left">
            {/* Queue Header Toolbar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {files.length}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {isId ? 'Antrean Batch File' : 'Batch File Queue'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold uppercase">
                      {activeCategory}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total: <strong>{formatSize(totalQueueSize)}</strong> | {successCount}/{files.length} {isId ? 'selesai' : 'done'}
                  </span>
                </div>
              </div>

              {/* Batch Format Selector + Add / Clear Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Global format selector */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isId ? 'Ubah Semua ke:' : 'Convert All to:'}
                  </span>
                  <select
                    value={batchTargetFormat}
                    onChange={(e) => handleBatchTargetChange(e.target.value)}
                    aria-label="Batch target format for all files"
                    className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                  >
                    {availableTargets.map((fmt) => (
                      <option key={fmt} value={fmt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {fmt}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addMore}</span>
                </button>

                <button
                  onClick={clearAllFiles}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearAll}</span>
                </button>
              </div>
            </div>

            {/* Queue Items List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {files.map((item, idx) => {
                const isSettingsOpen = expandedSettingsId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 transition shadow-2xs hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Left: Item Index + Icon + Filename + Sizes */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-mono text-slate-400 w-4 text-center">
                          {idx + 1}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{formatSize(item.size)}</span>
                            {item.outputSize && (
                              <>
                                <span>→</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {formatSize(item.outputSize)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Target format + Options + Convert/Download + Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
                        {/* Target Format selector */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-mono">to</span>
                          <select
                            value={item.targetFormat}
                            disabled={item.status === 'converting'}
                            onChange={(e) => updateTargetFormat(item.id, e.target.value)}
                            aria-label={`Target format for ${item.name}`}
                            className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                          >
                            {availableTargets.map((fmt) => (
                              <option key={fmt} value={fmt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                {fmt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Options button */}
                        <button
                          onClick={() => setExpandedSettingsId(isSettingsOpen ? null : item.id)}
                          aria-label={`Options for ${item.name}`}
                          className={`p-1.5 rounded-xl border transition ${
                            isSettingsOpen
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                          }`}
                          title={t.optionsBtn}
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Convert or Download */}
                        {item.status === 'success' ? (
                          <button
                            onClick={() => handleBlobDownload(item)}
                            disabled={item.downloading}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-2xs cursor-pointer"
                          >
                            {item.downloading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">{item.downloading ? '...' : t.download}</span>
                          </button>
                        ) : item.status === 'converting' ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{Math.round(item.progress)}%</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => convertSingleFile(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-2xs cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span className="hidden sm:inline">Convert</span>
                          </button>
                        )}

                        {/* Remove item */}
                        <button
                          onClick={() => removeFile(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar during FFmpeg Lifecycle */}
                    {item.status === 'converting' && (
                      <ConversionProgressBar
                        progress={item.progress}
                        stage={item.progressStage}
                        lang={lang}
                      />
                    )}

                    {/* Error indicator */}
                    {item.status === 'error' && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.errorMessage || t.statusError}</span>
                      </div>
                    )}

                    {/* Advanced Settings Drawer */}
                    {isSettingsOpen && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                            {t.options.quality}
                          </label>
                          <select
                            value={item.options.quality || 'medium'}
                            onChange={(e) => updateOption(item.id, 'quality', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs"
                          >
                            <option value="high">{t.options.qualityHigh}</option>
                            <option value="medium">{t.options.qualityMedium}</option>
                            <option value="low">{t.options.qualityLow}</option>
                          </select>
                        </div>

                        {item.category === 'video' && (
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                              {t.options.resolution}
                            </label>
                            <select
                              value={item.options.resolution || 'original'}
                              onChange={(e) => updateOption(item.id, 'resolution', e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs"
                            >
                              <option value="original">{t.options.resolutionOriginal}</option>
                              <option value="1080p">1080p Full HD</option>
                              <option value="720p">720p HD</option>
                              <option value="480p">480p SD</option>
                            </select>
                          </div>
                        )}

                        {(item.category === 'audio' || ['mp3', 'wav', 'aac'].includes(item.targetFormat.toLowerCase())) && (
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                              {t.options.bitrate}
                            </label>
                            <select
                              value={item.options.bitrate || '192k'}
                              onChange={(e) => updateOption(item.id, 'bitrate', e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs"
                            >
                              <option value="320k">320 kbps (Ultra)</option>
                              <option value="256k">256 kbps (High)</option>
                              <option value="192k">192 kbps (Standard)</option>
                              <option value="128k">128 kbps (Compact)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Responsive In-Queue / Pre-Download Display Ad Slot */}
            <div className="w-full my-2">
              <AdSlot type="auto" lang={lang} slotId="5462390377" className="!my-0 !px-0" />
            </div>

            {/* Queue Actions Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {files.length} {isId ? 'file dalam antrean batch' : 'files in batch queue'}
              </span>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Download All as ZIP Archive Button */}
                {hasSuccessfulFiles && (
                  <button
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isId ? 'Membuat ZIP...' : 'Zipping...'}</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>
                          {successCount > 1
                            ? isId
                              ? `Unduh Semua ZIP (${successCount})`
                              : `Download All ZIP (${successCount})`
                            : t.download}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {/* Convert All Button */}
                {hasPendingFiles && (
                  <button
                    onClick={convertAllFiles}
                    disabled={globalConverting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {globalConverting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.converting}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          {isId ? `Konversi Semua (${files.length})` : `Convert All (${files.length})`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mismatch Modal Popup */}
      <MismatchModal
        isOpen={mismatchInfo !== null}
        onClose={() => setMismatchInfo(null)}
        fileName={
          mismatchInfo
            ? mismatchInfo.files.length > 1
              ? `${mismatchInfo.files.length} files (${mismatchInfo.files[0].name}, ...)`
              : mismatchInfo.files[0]?.name || ''
            : ''
        }
        expectedCategory={activeCategory}
        detectedCategory={mismatchInfo?.detectedCategory || 'image'}
        onSwitchAndAdd={handleMismatchSwitch}
        lang={lang}
      />
    </div>
  );
};
