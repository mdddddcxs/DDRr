import React from 'react';

/** Emblème DDR : arche (mihrab) + croissant, dégradé orange → or. */
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'h-11 w-11' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <defs>
      <linearGradient id="ddr-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fdba74" />
        <stop offset="0.5" stopColor="#f97316" />
        <stop offset="1" stopColor="#c2410c" />
      </linearGradient>
      <linearGradient id="ddr-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3dfa2" />
        <stop offset="1" stopColor="#dcb44a" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#ddr-g)" />
    <path d="M14 38V24c0-6 4.5-11 10-13 5.5 2 10 7 10 13v14z" fill="#120e0b" opacity="0.92" />
    <path d="M18.5 38V26c0-3.6 2.4-6.6 5.5-7.8 3.1 1.2 5.5 4.2 5.5 7.8v12" fill="none" stroke="url(#ddr-gold)" strokeWidth="1.4" />
    <path d="M26.6 27.6a3.6 3.6 0 1 1-3.4-5.2 2.9 2.9 0 1 0 3.4 5.2z" fill="url(#ddr-gold)" />
    <path d="M24 6.5l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="#fff7ed" />
  </svg>
);

const Logo: React.FC<{ className?: string; showArabic?: boolean }> = ({ className = '', showArabic = true }) => (
  <span className={`flex items-center gap-3 ${className}`}>
    <LogoMark className="h-11 w-11 shrink-0 drop-shadow-[0_6px_18px_rgba(249,115,22,0.35)]" />
    <span className="flex flex-col leading-none">
      <span className="font-serif text-[22px] font-semibold tracking-tight text-cream-50">
        La <span className="text-brand-400">DDR</span>
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-sand-400">Dawah dans la rue</span>
      {showArabic && (
        <span className="mt-0.5 font-arabic text-[13px] text-gold-300/80" lang="ar" dir="rtl">
          الدعوة في الشارع
        </span>
      )}
    </span>
  </span>
);

export default Logo;
