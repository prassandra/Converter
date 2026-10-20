import React from 'react';

interface FlagProps {
  className?: string;
}

/**
 * High-definition Indonesian Flag (Sang Saka Merah Putih) SVG
 * Crisp on all Desktop (Windows, macOS, Linux) and mobile screens
 */
export const IndonesiaFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 20 14"
    className={`inline-block rounded-xs overflow-hidden shrink-0 shadow-2xs border border-slate-300/80 dark:border-slate-700 ${className}`}
    aria-hidden="true"
  >
    <rect width="20" height="7" fill="#dc2626" />
    <rect y="7" width="20" height="7" fill="#ffffff" />
  </svg>
);

/**
 * High-definition UK / English Flag (Union Jack) SVG
 * Accurately rendered vector geometry that never fails on Windows Desktop
 */
export const EnglishFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 60 42"
    className={`inline-block rounded-xs overflow-hidden shrink-0 shadow-2xs border border-slate-300/80 dark:border-slate-700 ${className}`}
    aria-hidden="true"
  >
    <clipPath id="ukClip">
      <rect width="60" height="42" />
    </clipPath>
    <g clipPath="url(#ukClip)">
      {/* Navy Blue Background */}
      <rect width="60" height="42" fill="#1e3a8a" />
      {/* White Diagonals */}
      <path d="M0,0 L60,42 M60,0 L0,42" stroke="#ffffff" strokeWidth="8.4" />
      {/* Red Diagonals */}
      <path d="M0,0 L60,42" stroke="#dc2626" strokeWidth="2.8" />
      <path d="M60,0 L0,42" stroke="#dc2626" strokeWidth="2.8" />
      {/* White Central Cross */}
      <path d="M30,0 v42 M0,21 h60" stroke="#ffffff" strokeWidth="14" />
      {/* Red Central Cross */}
      <path d="M30,0 v42 M0,21 h60" stroke="#dc2626" strokeWidth="8.4" />
    </g>
  </svg>
);
