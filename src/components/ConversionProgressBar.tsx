import React from 'react';
import { Loader2, CheckCircle2, Cpu, Sparkles, UploadCloud } from 'lucide-react';
import { Language } from '../types';

interface ConversionProgressBarProps {
  progress: number;
  stage?: string;
  isComplete?: boolean;
  lang: Language;
}

export const ConversionProgressBar: React.FC<ConversionProgressBarProps> = ({
  progress,
  stage,
  isComplete = false,
  lang,
}) => {
  const isId = lang === 'id';

  // Determine stage description based on progress percentage
  const getStageInfo = (pct: number) => {
    if (pct < 30) {
      return {
        step: 1,
        title: isId ? 'Mengunggah File ke Server' : 'Uploading File to Server',
        sub: isId ? 'Menyiapkan buffer memori input' : 'Preparing input memory buffer',
        icon: <UploadCloud className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />,
      };
    }
    if (pct < 65) {
      return {
        step: 2,
        title: isId ? 'Analisis Stream & Codec FFmpeg' : 'Probing FFmpeg Streams & Codecs',
        sub: isId ? 'Memeriksa resolusi, frame rate, & audio track' : 'Checking resolution, frame rate, & audio tracks',
        icon: <Cpu className="w-3.5 h-3.5 text-violet-500 animate-pulse" />,
      };
    }
    if (pct < 95) {
      return {
        step: 3,
        title: isId ? 'Encoding & Pemrosesan Filter' : 'Encoding & Filter Processing',
        sub: isId ? 'Menerapkan transformasi media berkecepatan tinggi' : 'Applying high-speed media transformation',
        icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
      };
    }
    return {
      step: 4,
      title: isId ? 'Finalisasi & Siap Diunduh' : 'Finalizing & Ready for Download',
      sub: isId ? 'Menyelesaikan muxing container output' : 'Completing container muxing',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    };
  };

  const stageInfo = getStageInfo(progress);

  return (
    <div className="w-full mt-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 shadow-inner">
      {/* Top row: Stage Title + Percentage */}
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-2">
          {stageInfo.icon}
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              {stage || stageInfo.title}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
              {stageInfo.sub}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
          {!isComplete && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Animated Glowing Progress Track */}
      <div className="relative w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full transition-all duration-300 relative"
          style={{ width: `${Math.min(Math.max(progress, 3), 100)}%` }}
        >
          {/* Shimmer animation on active progress */}
          {!isComplete && (
            <div className="absolute inset-0 bg-white/30 skew-x-12 animate-pulse" />
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-1 mt-2 text-[9px] font-medium text-slate-400 dark:text-slate-500 text-center">
        <div className={progress >= 20 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
          1. Upload
        </div>
        <div className={progress >= 50 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
          2. FFmpeg Probe
        </div>
        <div className={progress >= 80 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
          3. Transcode
        </div>
        <div className={progress >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
          4. Ready
        </div>
      </div>
    </div>
  );
};
