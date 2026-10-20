import React from 'react';
import { RefreshCw, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { Language, ModalType, ConverterCategory } from '../types';
import { translations } from '../translations';

interface FooterProps {
  lang: Language;
  onOpenModal: (type: ModalType) => void;
  onSelectCategory: (cat: ConverterCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenModal, onSelectCategory }) => {
  const isId = lang === 'id';
  const t = translations[lang].footer;
  const tNav = translations[lang].nav;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  Dria<span className="text-blue-600 dark:text-blue-500">Convert</span>
                </span>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                  HD
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.desc}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isId ? 'Privasi Terenkripsi & Server FFmpeg Cepat' : 'Encrypted Privacy & High-Speed FFmpeg'}</span>
            </div>
          </div>

          {/* Col 2: Menu Alat / Tools (DriaSave & DriaSeo) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.quickLinks}
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href="https://save.driacom.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block group p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50 transition"
              >
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  <span>DriaSave</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                  {isId
                    ? 'Tools untuk mengunduh video, audio atau gambar dari berbagai sumber sosial media'
                    : 'Tools to download video, audio or images from various social media sources'}
                </p>
              </a>

              <a
                href="https://seo.driacom.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block group p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50 transition"
              >
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  <span>DriaSeo</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                  {isId
                    ? 'Tools untuk cek metrik domain authority dan domain rating'
                    : 'Tools to check domain authority and domain rating metrics'}
                </p>
              </a>
            </div>
          </div>

          {/* Col 3: Kategori Konversi File */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isId ? 'Kategori Konversi' : 'Converter Formats'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('video')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.video} (MP4, MKV, AVI, WebM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('audio')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.audio} (MP3, WAV, AAC, FLAC)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('image')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.image} (JPG, PNG, WebP, AVIF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('document')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.document} (PDF, DOCX, TXT)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Trust Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.legalLinks}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onOpenModal('about')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('contact')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.contact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('disclaimer')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.disclaimer}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                >
                  {tNav.terms}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner: Created by Driacom & Copyright */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {currentYear} DriaConvert. {t.rights}
          </div>

          {/* Prominent "Created by Driacom" with link to https://driacom.com */}
          <div className="flex items-center gap-1.5 font-medium">
            <span>{t.createdBy}</span>
            <a
              href="https://driacom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
            >
              <span>Driacom</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
