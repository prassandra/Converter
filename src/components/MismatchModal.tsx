import React from 'react';
import { AlertTriangle, ArrowRight, X, Video, Music, Image as ImageIcon, FileText } from 'lucide-react';
import { ConverterCategory, Language } from '../types';

interface MismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  expectedCategory: ConverterCategory;
  detectedCategory: ConverterCategory;
  onSwitchAndAdd: () => void;
  lang: Language;
}

export const MismatchModal: React.FC<MismatchModalProps> = ({
  isOpen,
  onClose,
  fileName,
  expectedCategory,
  detectedCategory,
  onSwitchAndAdd,
  lang,
}) => {
  if (!isOpen) return null;

  const isId = lang === 'id';

  const categoryLabels: Record<ConverterCategory, { id: string; en: string; icon: React.ReactNode }> = {
    video: { id: 'Video', en: 'Video', icon: <Video className="w-5 h-5 text-purple-500" /> },
    audio: { id: 'Audio', en: 'Audio', icon: <Music className="w-5 h-5 text-emerald-500" /> },
    image: { id: 'Gambar (Image)', en: 'Image', icon: <ImageIcon className="w-5 h-5 text-amber-500" /> },
    document: { id: 'Dokumen / File', en: 'Document / File', icon: <FileText className="w-5 h-5 text-blue-500" /> },
  };

  const expectedName = isId ? categoryLabels[expectedCategory].id : categoryLabels[expectedCategory].en;
  const detectedName = isId ? categoryLabels[detectedCategory].id : categoryLabels[detectedCategory].en;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isId ? 'Peringatan Format File' : 'File Format Mismatch'}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {isId ? 'Format File Tidak Sesuai Kategori' : 'File Does Not Match Category'}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 mb-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <p>
            {isId ? (
              <>
                Anda sedang membuka tab <strong className="text-indigo-600 dark:text-indigo-400">{expectedName} Converter</strong>, namun file yang Anda masukkan:
              </>
            ) : (
              <>
                You are currently on the <strong className="text-indigo-600 dark:text-indigo-400">{expectedName} Converter</strong> tab, but the uploaded file:
              </>
            )}
          </p>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono text-[11px]">
            <span className="truncate max-w-[200px] text-slate-900 dark:text-white font-semibold">{fileName}</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              {detectedName}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            {isId
              ? 'Apakah Anda ingin beralih secara otomatis ke kategori yang sesuai agar file dapat diproses dengan benar oleh FFmpeg?'
              : 'Would you like to automatically switch to the matching category so FFmpeg can convert your file properly?'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={onSwitchAndAdd}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <span>{isId ? `Beralih ke ${detectedName}` : `Switch to ${detectedName}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
