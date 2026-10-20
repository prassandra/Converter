import React from 'react';
import { Video, Music, Image as ImageIcon, FileText, Check } from 'lucide-react';
import { Language } from '../types';

export const SupportedFormatsSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const isId = lang === 'id';

  const categories = [
    {
      title: isId ? 'Format Video' : 'Video Formats',
      icon: <Video className="w-5 h-5 text-indigo-500" />,
      formats: ['MP4', 'WEBM', 'MKV', 'AVI', 'MOV', 'FLV', 'WMV', 'GIF', 'M4V', '3GP', 'TS'],
      desc: isId ? 'Konversi video dengan resolusi hingga 1080p Full HD dan opsi kompresi lanjutan.' : 'Convert videos up to 1080p Full HD with advanced compression presets.',
    },
    {
      title: isId ? 'Format Audio' : 'Audio Formats',
      icon: <Music className="w-5 h-5 text-emerald-500" />,
      formats: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A', 'OPUS', 'AIFF', 'WMA'],
      desc: isId ? 'Ekstrak suara dari video atau konversi lagu dengan opsi bitrate hingga 320 kbps.' : 'Extract audio from video or convert music with high-bitrate options up to 320 kbps.',
    },
    {
      title: isId ? 'Format Gambar' : 'Image Formats',
      icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
      formats: ['PNG', 'JPG / JPEG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'ICO', 'AVIF', 'PDF'],
      desc: isId ? 'Kompresi gambar web modern WebP/AVIF untuk mempercepat loading website.' : 'Compress modern web images like WebP & AVIF for ultra-fast website load times.',
    },
    {
      title: isId ? 'Format Dokumen & Data' : 'Document & Data Formats',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      formats: ['PDF', 'TXT', 'MARKDOWN (.md)', 'HTML', 'CSV', 'JSON'],
      desc: isId ? 'Konversi gambar ke PDF, parsing teks, dan transformasi data tabular CSV ke JSON.' : 'Convert images to PDF, parse text, and transform tabular CSV data to structured JSON.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {isId ? 'Dukungan Format Lengkap' : 'Extensive Format Compatibility'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {isId
            ? 'Didukung oleh pustaka FFmpeg server terbaik untuk interoperabilitas lintas format tanpa cela.'
            : 'Backed by the FFmpeg server engine for seamless cross-format interoperability.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                {cat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {cat.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {cat.desc}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.formats.map((fmt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <Check className="w-3 h-3 text-indigo-500" />
                  <span>{fmt}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
