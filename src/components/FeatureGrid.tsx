import React from 'react';
import { Cpu, ShieldCheck, Layers, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export const FeatureGrid: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].features;

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: t.f1_title,
      desc: t.f1_desc,
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/60',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: t.f2_title,
      desc: t.f2_desc,
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: t.f3_title,
      desc: t.f3_desc,
      bg: 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/60',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: t.f4_title,
      desc: t.f4_desc,
      bg: 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-200/60 dark:border-cyan-800/60',
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          {t.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${item.bg}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center mb-4 shadow-xs">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
