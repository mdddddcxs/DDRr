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
        <option key={c.code} value={c.code} className="bg-night-900">
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
