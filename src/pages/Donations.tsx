import React, { useEffect, useState } from 'react';
import { HandHeart, MessageCircle, Package, Phone, ShieldCheck, Smartphone } from 'lucide-react';
import { ButtonLink, Container, Eyebrow, PageHero, formatFCFA } from '../components/ui';
import { SCHOOL_CAMPAIGN } from '../constants';
import { telHref, useSite, waHref } from '../lib/site';
import { getCampaign, getRecentDonations, type PublicDonation } from '../services/db';
import type { DonationCampaign } from '../types';

// Le paiement en ligne (Mobile Money) sera activé quand la DDR aura son propre compte marchand.
// D'ici là, cette page explique comment donner en contactant directement l'association.
const ONLINE_PAYMENT_READY = false;

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `il y a ${Math.max(1, Math.round(d / 60))} min`;
  if (d < 86400) return `il y a ${Math.round(d / 3600)} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const Donations = () => {
  const site = useSite();
  const [c, setC] = useState<DonationCampaign>(SCHOOL_CAMPAIGN);
  const [recent, setRecent] = useState<PublicDonation[]>([]);
  useEffect(() => {
    getCampaign().then(setC);
    getRecentDonations(8).then(setRecent);
  }, []);
  const pct = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));

  return (
    <>
      <PageHero
        eyebrow="Sadaqa jariya"
        title={<>Investir pour <span className="text-gradient-gold">l’éternité</span></>}
        subtitle="Votre don n’est pas une dépense : c’est une aumône continue qui bénéficiera à des générations d’élèves et de fidèles."
      />
      <Container className="pb-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <article className="card overflow-hidden">
            <div className="relative aspect-[16/8] bg-night-800">
              {c.imageUrl && <img src={c.imageUrl} alt="" className="h-full w-full object-cover opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/30 to-transparent" />
              <div className="absolute bottom-0 p-6 md:p-8">
                <Eyebrow>Projet en cours</Eyebrow>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-cream-50 md:text-4xl">{c.title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-lg leading-relaxed text-sand-400">{c.description}</p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-sand-500">Collecté</p>
                  <p className="font-serif text-4xl font-semibold text-white">{formatFCFA(c.currentAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-sand-500">Objectif</p>
                  <p className="text-xl font-bold text-cream-200">{formatFCFA(c.targetAmount)}</p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-gold-300" style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>
              <p className="mt-2 text-sm font-bold text-brand-300">{pct}% de l’objectif</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {c.trustIndicators.map((t) => (
                  <li key={t.title} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <span className="text-2xl" aria-hidden>{t.icon}</span>
                    <p className="mt-2 font-bold text-cream-50">{t.title}</p>
                    <p className="text-sm text-sand-400">{t.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="card border-brand-500/25 p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-cream-50">
                <HandHeart className="h-6 w-6 text-brand-400" /> Comment donner
              </h2>
              {!ONLINE_PAYMENT_READY && (
                <p className="mt-3 rounded-2xl border border-gold-400/25 bg-gold-400/10 p-3 text-sm text-gold-200">
                  <Smartphone className="mr-1 inline h-4 w-4" /> Le don en ligne par Wave, Orange Money et MTN arrive très bientôt. En attendant, contactez-nous : un responsable vous indique le numéro officiel de la DDR.
                </p>
              )}
              <div className="mt-5 space-y-3">
                <a href={waHref(site.contact.whatsapp, `Assalamou alaykoum, je souhaite faire un don pour « ${c.title} ».`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-500">
                  <MessageCircle className="h-5 w-5" /> Donner via WhatsApp
                </a>
                <a href={telHref(site.contact.phones[0] || '')} className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3.5 font-bold text-cream-100 transition hover:bg-white/5">
                  <Phone className="h-5 w-5" /> Appeler {site.contact.phones[0]}
                </a>
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs text-sand-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                Ne donnez qu’aux numéros communiqués par les responsables de la DDR. La DDR ne vous demandera jamais votre code secret.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-cream-50"><Package className="h-5 w-5 text-brand-400" /> Don matériel</h3>
              <p className="mt-2 text-sm text-sand-400">Ciment, fer, chaises, livres, sonorisation… Dites-nous ce que vous souhaitez offrir, nous organisons la récupération.</p>
              <ButtonLink to="/appointments" variant="ghost" size="sm" className="mt-4">Proposer un don matériel</ButtonLink>
            </div>

            {recent.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-cream-50">Derniers dons</h3>
                <ul className="mt-4 divide-y divide-white/5">
                  {recent.map((d) => (
                    <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-cream-200">{d.donorName}</span>
                      <span className="text-right">
                        <span className="block font-bold text-white">{formatFCFA(d.amount)}</span>
                        <span className="text-xs text-sand-500">{timeAgo(d.createdAt)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-sand-500">Qu’Allah accepte de chacun.</p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
};

export default Donations;
