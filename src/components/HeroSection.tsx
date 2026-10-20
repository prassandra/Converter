import React from 'react';
import { Language, ConverterCategory } from '../types';

interface HeroSectionProps {
  lang: Language;
  onQuickPreset?: (category: ConverterCategory, targetFormat: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang }) => {
  const isId = lang === 'id';

  return (
    <section className="relative pt-6 pb-2 sm:pt-10 sm:pb-4 text-center px-4 sm:px-6 max-w-4xl mx-auto overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* 1. Luminous Clean Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-sky-50/90 dark:bg-sky-950/50 border border-sky-200/90 dark:border-sky-800/80 text-sky-700 dark:text-sky-300 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-2xs">
        <span>✨</span>
        <span className="text-amber-500 font-bold">⚡</span>
        <span>
          {isId
            ? 'Konversi Super Cepat & Tanpa Batas'
            : 'Ultra Fast Conversion & Unlimited'}
        </span>
      </div>

      {/* 2. Hero Headline - Specific for Video, Audio, Gambar & Dokumen */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.18] sm:leading-[1.14] mb-4 sm:mb-6 px-1">
        {isId ? (
          <>
            <span className="block">Konversi Video, Audio,</span>
            <span>Gambar &amp; </span>
            <span className="text-blue-600 dark:text-blue-400">Dokumen</span>
            <span className="block mt-1 text-indigo-600 dark:text-indigo-400">
              Cepat &amp; Tanpa Batas
            </span>
          </>
        ) : (
          <>
            <span className="block">Convert Video, Audio,</span>
            <span>Images &amp; </span>
            <span className="text-blue-600 dark:text-blue-400">Documents</span>
            <span className="block mt-1 text-indigo-600 dark:text-indigo-400">
              Fast &amp; Unlimited
            </span>
          </>
        )}
      </h1>

      {/* 3. Subtitle - Accurate File Converter Description (No TikTok/YouTube/Instagram) */}
      <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6 sm:mb-8 px-2">
        {isId
          ? 'Ubah format file video, audio, gambar, dan dokumen Anda secara instan dengan mesin server FFmpeg berkecepatan tinggi. 100% gratis, aman, dan tanpa watermark.'
          : 'Convert your video, audio, image, and document files instantly with high-speed server FFmpeg. 100% free, secure, and no watermark.'}
      </p>
    </section>
  );
};
