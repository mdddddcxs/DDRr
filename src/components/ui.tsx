// Briques d'interface réutilisables (boutons, titres de section, en-têtes de page…)
import React from 'react';
import { Link } from 'react-router-dom';

type BtnVariant = 'primary' | 'gold' | 'ghost' | 'outline' | 'navy' | 'light';
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-gradient-to-b from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-600 shadow-[0_12px_28px_-12px_rgba(226,112,10,0.75)]',
  gold: 'bg-gradient-to-r from-gold-300 to-gold-500 text-ink-900 hover:brightness-110 shadow-[0_10px_30px_-12px_rgba(220,180,74,0.7)]',
  navy: 'bg-ink-900 text-white hover:bg-ink-800 shadow-[0_12px_28px_-14px_rgba(20,36,74,0.8)]',
  light: 'bg-white text-ink-900 hover:bg-ivory-100 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.4)]',
  ghost: 'bg-white/70 text-ink-900 hover:bg-white border border-ink-900/10 backdrop-blur',
  outline: 'border border-brand-500/60 text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-500',
};
const btnSizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-[15px]', lg: 'px-8 py-4 text-base' };

type BtnProps = { variant?: BtnVariant; size?: keyof typeof btnSizes; className?: string; children: React.ReactNode };

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...rest }: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`} {...rest}>
    {children}
  </button>
);

export const ButtonLink = ({ to, href, variant = 'primary', size = 'md', className = '', children }: BtnProps & { to?: string; href?: string }) => {
  const cls = `${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to || '/'} className={cls}>
      {children}
    </Link>
  );
};

export const Eyebrow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300 ${className}`}>
    {children}
  </span>
);

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  action?: React.ReactNode;
}) => (
  <div className={`mb-10 md:mb-14 flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
    <div className={align === 'center' ? 'max-w-2xl' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="font-serif text-3xl md:text-5xl font-semibold text-ink-900 leading-[1.1]">{title}</h2>
      {subtitle && <p className="mt-4 text-base md:text-lg text-ink-500 leading-relaxed">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/** En-tête commun des pages intérieures */
export const PageHero = ({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }) => (
  <header className="relative overflow-hidden px-4 pt-14 pb-12 md:pt-20 md:pb-16 text-center">
    <div className="absolute inset-0 bg-pattern opacity-[0.05] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-72 w-[42rem] max-w-full rounded-full bg-brand-600/15 blur-[90px]" aria-hidden />
    <div className="relative mx-auto max-w-3xl animate-fade-up">
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      <h1 className="font-serif text-4xl md:text-6xl font-semibold text-ink-900 leading-[1.05]">{title}</h1>
      {subtitle && <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-ink-500 leading-relaxed">{subtitle}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </header>
);

export const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
);

export const Spinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden />
);

export const Notice = ({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: React.ReactNode }) => {
  const tones = {
    info: 'border-gold-400/30 bg-gold-400/10 text-gold-700',
    error: 'border-red-500/30 bg-red-500/10 text-red-700',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
};

/** Champ invisible anti-robots : un humain ne le remplit jamais. */
export const Honeypot = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <label>
      Ne pas remplir
      <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

export const formatFCFA = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} F CFA`;

/** Avatar : photo si disponible, sinon initiales élégantes. */
export const Avatar = ({ name, src, className = 'h-20 w-20 text-2xl' }: { name: string; src?: string; className?: string }) => {
  const [failed, setFailed] = React.useState(!src);
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .slice(-2)
    .map((w) => w[0])
    .join('');
  return failed ? (
    <div className={`grid place-items-center rounded-full bg-gradient-to-br from-brand-500 via-brand-700 to-ivory-200 font-serif font-semibold text-white ring-1 ring-ink-900/10 ${className}`}>
      {initials || 'DDR'}
    </div>
  ) : (
    <img src={src} alt={name} onError={() => setFailed(true)} className={`rounded-full object-cover ring-1 ring-ink-900/10 ${className}`} loading="lazy" />
  );
};
