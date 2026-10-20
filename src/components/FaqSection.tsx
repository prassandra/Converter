import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export const FaqSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].faq;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 },
    { q: t.q4, a: t.a4 },
    { q: t.q5, a: t.a5 },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>F.A.Q</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.title}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-500' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
