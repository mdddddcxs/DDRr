import React from 'react';
import { COUNTRY_CODES } from '../constants';

/** Téléphone avec indicatif pays. Renvoie la valeur complète via onChange. */
export const PhoneField = ({
  id,
  country,
  number,
  onCountry,
  onNumber,
  required = true,
}: {
  id: string;
  country: string;
  number: string;
  onCountry: (v: string) => void;
  onNumber: (v: string) => void;
  required?: boolean;
}) => (
  <div className="flex gap-2">
    <select aria-label="Indicatif pays" value={country} onChange={(e) => onCountry(e.target.value)} className="input !w-auto !px-3">
      {COUNTRY_CODES.map((c) => (
        <option key={c.code} value={c.code} className="bg-ivory-50">
          {c.flag} {c.code}
        </option>
      ))}
    </select>
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      required={required}
      value={number}
      onChange={(e) => onNumber(e.target.value.replace(/[^\d\s]/g, '').slice(0, 15))}
      placeholder="07 00 00 00 00"
      className="input"
    />
  </div>
);

export const fullPhone = (country: string, number: string) => `${country} ${number.trim()}`;
export const isPhoneValid = (number: string) => number.replace(/\D/g, '').length >= 8;

/** Champ photo pour l'admin : envoi depuis le téléphone/ordinateur ou adresse https. */
export const ImageField = ({
  id,
  label,
  value,
  onChange,
  upload,
  round = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
  round?: boolean;
}) => {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await upload(f));
    } catch (x: any) {
      setErr(x?.message || 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-4">
        <div className={`h-20 w-20 shrink-0 overflow-hidden bg-ivory-200 ring-1 ring-ink-900/10 ${round ? 'rounded-full' : 'rounded-xl'}`}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-ink-400">Aucune</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={id} className={`cursor-pointer rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {busy ? 'Envoi…' : value ? 'Changer la photo' : 'Choisir une photo'}
          </label>
          <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
          {value && (
            <button type="button" onClick={() => onChange('')} className="rounded-full bg-ink-900/5 px-4 py-2 text-sm font-bold text-ink-500 hover:text-ink-900">
              Retirer
            </button>
          )}
        </div>
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
};
