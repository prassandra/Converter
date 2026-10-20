import React from 'react';
import { UploadCloud, Sliders, Download } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export const HowItWorks: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].howItWorks;

  const steps = [
    {
      step: '01',
      icon: <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: t.step1_title,
      desc: t.step1_desc,
    },
    {
      step: '02',
      icon: <Sliders className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
      title: t.step2_title,
      desc: t.step2_desc,
    },
    {
      step: '03',
      icon: <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: t.step3_title,
      desc: t.step3_desc,
    },
  ];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
          {t.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
        {steps.map((st, i) => (
          <div
            key={i}
            className="flex items-start sm:flex-col sm:items-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition gap-3.5 sm:gap-2.5 sm:text-center text-left"
          >
            <div className="flex items-center justify-center shrink-0">
              <div className="relative w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700/80">
                {st.icon}
                <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-600 text-white">
                  {st.step}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                {st.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
