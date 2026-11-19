import React from 'react';

/**
 * Emblème officiel de La DDR (redessiné en vectoriel d'après le logo de l'association) :
 * croissant et étoile, toit, mosquée aux deux portes en arche.
 * `tone="light"` pour les fonds sombres (toit en blanc).
 */
export const LogoMark: React.FC<{ className?: string; tone?: 'dark' | 'light'; title?: string }> = ({ className = 'h-12 w-auto', tone = 'dark', title }) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="238 0 320 440" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`o${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDB022" />
          <stop offset="1" stopColor="#EE7A0C" />
        </linearGradient>
        <mask id={`m${id}`}>
          <rect x="200" y="0" width="400" height="200" fill="#fff" />
          <circle cx="425" cy="56" r="52" fill="#000" />
        </mask>
      </defs>
      <circle cx="398" cy="76" r="60" fill={`url(#o${id})`} mask={`url(#m${id})`} />
      <path d="M428 42l8 16.2 17.9 2.6-13 12.6 3.1 17.8-16-8.4-16 8.4 3.1-17.8-13-12.6 17.9-2.6z" fill={`url(#o${id})`} />
      <path d="M258 241L398 150L538 241V278L398 187L258 278Z" fill={tone === 'light' ? '#FFFFFF' : '#14244A'} />
      <path d="M258 298L398 207L538 298V405H494V336A21 21 0 0 0 452 336V405L398 434L344 405V336A21 21 0 0 0 302 336V405H258Z" fill={`url(#o${id})`} />
    </svg>
  );
};

/** Logo complet : emblème + « DDR » + nom de l'association. */
const Logo: React.FC<{ className?: string; showArabic?: boolean; tone?: 'dark' | 'light'; size?: 'sm' | 'md' }> = ({
  className = '',
  showArabic = true,
  tone = 'dark',
  size = 'md',
}) => (
  <span className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark tone={tone} className={`${size === 'sm' ? 'h-10' : 'h-12'} w-auto shrink-0`} />
    <span className="flex flex-col leading-none">
      <span className={`font-display font-extrabold tracking-tight ${size === 'sm' ? 'text-[22px]' : 'text-[26px]'} ${tone === 'light' ? 'text-white' : 'text-ink-900'}`}>DDR</span>
      <span className="mt-0.5 font-serif text-[12.5px] font-semibold text-brand-600 whitespace-nowrap">La Da’awah Dans la Rue</span>
      {showArabic && (
        <span className={`mt-0.5 font-arabic text-[13px] ${tone === 'light' ? 'text-white/80' : 'text-ink-700'}`} lang="ar" dir="rtl">
          الدعوة في الشارع
        </span>
      )}
    </span>
  </span>
);

export default Logo;
