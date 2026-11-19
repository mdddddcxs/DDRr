// Studio Da'wa — identité bleu ciel. Créer une carte de rappel à partager (post carré ou story).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Image as ImageIcon, Palette, PenLine, Share2, Smartphone, Square, Type } from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';
import RubriqueHero from '../components/RubriqueHero';
import { LogoMark } from '../components/Logo';
import { Container } from '../components/ui';
import { rubriqueVars } from '../lib/rubriques';
import { useReveal } from '../lib/useReveal';
import { trackEvent } from '../lib/analytics';

type Quote = { cat: string; arabic: string; phonetic: string; french: string; source: string };

const QUOTES: Quote[] = [
  { cat: 'Science', arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', phonetic: 'Wa qul Rabbi zidnî ‘ilmâ', french: 'Et dis : « Ô mon Seigneur, accroît mes connaissances ! »', source: 'Coran 20:114' },
  { cat: 'Patience', arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', phonetic: 'Inna-llâha ma‘a-s-sâbirîn', french: 'Certes, Allah est avec ceux qui sont patients.', source: 'Coran 2:153' },
  { cat: 'Espoir', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', phonetic: 'Fa inna ma‘a-l-‘usri yusrâ', french: 'À côté de la difficulté est, certes, une facilité.', source: 'Coran 94:5' },
  { cat: 'Espoir', arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', phonetic: 'Lâ yukallifu-llâhu nafsan illâ wus‘ahâ', french: 'Allah n’impose à aucune âme une charge supérieure à sa capacité.', source: 'Coran 2:286' },
  { cat: 'Espoir', arabic: 'فَإِنِّي قَرِيبٌ', phonetic: 'Fa innî qarîb', french: 'Je suis tout proche : Je réponds à l’appel de celui qui M’invoque.', source: 'Coran 2:186' },
  { cat: 'Pardon', arabic: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', phonetic: 'Lâ taqnatû min rahmati-llâh', french: 'Ne désespérez pas de la miséricorde d’Allah.', source: 'Coran 39:53' },
  { cat: 'Paix', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', phonetic: 'Alâ bi-dhikri-llâhi tatma’innu-l-qulûb', french: 'N’est-ce point par le rappel d’Allah que les cœurs s’apaisent ?', source: 'Coran 13:28' },
  { cat: 'Paix', arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', phonetic: 'Fadhkurûnî adhkurkum', french: 'Souvenez-vous de Moi, Je Me souviendrai de vous.', source: 'Coran 2:152' },
  { cat: 'Confiance', arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', phonetic: 'Wa man yatawakkal ‘ala-llâhi fa huwa hasbuh', french: 'Et quiconque place sa confiance en Allah, Il lui suffit.', source: 'Coran 65:3' },
  { cat: 'Fraternité', arabic: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', phonetic: 'Inna akramakum ‘inda-llâhi atqâkum', french: 'Le plus noble d’entre vous auprès d’Allah est le plus pieux.', source: 'Coran 49:13' },
  { cat: 'Fraternité', arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', phonetic: 'Lâ yu’minu ahadukum hattâ yuhibba li-akhîhi mâ yuhibbu li-nafsih', french: 'Aucun de vous n’est vraiment croyant tant qu’il n’aime pas pour son frère ce qu’il aime pour lui-même.', source: 'Al-Bukhârî et Muslim' },
  { cat: 'Fraternité', arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ', phonetic: 'Tabassumuka fî wajhi akhîka laka sadaqa', french: 'Ton sourire à ton frère est une aumône.', source: 'At-Tirmidhî' },
  { cat: 'Invocation', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', phonetic: 'Rabbanâ âtinâ fi-d-dunyâ hasanatan wa fi-l-âkhirati hasana', french: 'Seigneur ! Accorde-nous une belle part ici-bas, et une belle part dans l’au-delà.', source: 'Coran 2:201' },
  { cat: 'Invocation', arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', phonetic: 'Lâ ilâha illâ anta subhânaka innî kuntu mina-z-zâlimîn', french: 'Pas de divinité à part Toi ! Gloire à Toi ! J’ai été du nombre des injustes.', source: 'Invocation de Jonas, Coran 21:87' },
];

const STYLES = [
  { id: 'emeraude', name: 'Émeraude', bg: 'linear-gradient(150deg,#17775A,#0f3d31)', text: '#ffffff', accent: '#9de3c6', sub: 'rgba(255,255,255,.75)', mark: 'light' as const },
  { id: 'nuit', name: 'Nuit dorée', bg: 'linear-gradient(150deg,#22325a,#0c1730)', text: '#ffffff', accent: '#E9CC7A', sub: 'rgba(255,255,255,.72)', mark: 'light' as const },
  { id: 'ciel', name: 'Ciel', bg: 'linear-gradient(160deg,#E2F3FB,#b9e0f3)', text: '#123c55', accent: '#2382B5', sub: '#3b6a85', mark: 'dark' as const },
  { id: 'aube', name: 'Aube rosée', bg: 'linear-gradient(160deg,#FBEAF1,#f3cdd9)', text: '#5b2a3c', accent: '#A9567A', sub: '#7d4a5d', mark: 'dark' as const },
  { id: 'sable', name: 'Sable', bg: 'linear-gradient(160deg,#FFFDF9,#ECE0CC)', text: '#14244a', accent: '#B08118', sub: '#5d6481', mark: 'dark' as const },
  { id: 'lavande', name: 'Lavande', bg: 'linear-gradient(160deg,#F2ECFB,#d8c9f2)', text: '#3a2766', accent: '#7957B5', sub: '#5e4a86', mark: 'dark' as const },
];

const CATS = ['Toutes', ...Array.from(new Set(QUOTES.map((q) => q.cat)))];
const PATTERN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.12'%3E%3Cpath d='M30 4l7.5 18.5L56 30l-18.5 7.5L30 56l-7.5-18.5L4 30l18.5-7.5z'/%3E%3C/g%3E%3C/svg%3E\")";
const PATTERN_DARK = PATTERN.replace('%23ffffff', '%23000000').replace("stroke-opacity='0.12'", "stroke-opacity='0.06'");

const Step = ({ n, title, icon: Icon, children }: { n: number; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
  <div className="reveal rounded-3xl bg-white p-5 shadow-[0_18px_40px_-30px_rgba(23,95,135,0.5)] ring-1 ring-ink-900/[0.06] sm:p-6">
    <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink-900">
      <span className="r-grad grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold text-white">{n}</span>
      {title}
      <Icon className="r-ink ml-auto h-5 w-5" />
    </h2>
    <div className="mt-4">{children}</div>
  </div>
);

const StudioDawa = () => {
  useReveal();
  const [cat, setCat] = useState('Toutes');
  const [quote, setQuote] = useState<Quote>(QUOTES[0]);
  const [custom, setCustom] = useState({ on: false, text: '', source: '' });
  const [style, setStyle] = useState(STYLES[0]);
  const [format, setFormat] = useState<'post' | 'story'>('post');
  const [show, setShow] = useState({ arabic: true, phonetic: true, french: true, signature: true });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (cat === 'Toutes' ? QUOTES : QUOTES.filter((q) => q.cat === cat)), [cat]);
  const q = custom.on ? { cat: '', arabic: '', phonetic: '', french: custom.text || 'Écrivez votre rappel…', source: custom.source } : quote;
  const W = 360;
  const H = format === 'post' ? 360 : 640;

  const render = async (kind: 'png' | 'blob') => {
    if (!cardRef.current) return null;
    const opts = { pixelRatio: 3, cacheBust: true, width: W, height: H };
    return kind === 'png' ? toPng(cardRef.current, opts) : toBlob(cardRef.current, opts);
  };
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3500);
  };
  const download = async () => {
    setBusy(true);
    try {
      const url = (await render('png')) as string;
      const a = document.createElement('a');
      a.href = url;
      a.download = `rappel-ddr-${format}.png`;
      trackEvent('carte_creee');
      a.click();
      flash('Image enregistrée ✓');
    } catch {
      flash('La création de l’image a échoué. Réessayez.');
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    setBusy(true);
    try {
      const blob = (await render('blob')) as Blob | null;
      const file = blob && new File([blob], 'rappel-ddr.png', { type: 'image/png' });
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Rappel', text: `${q.french} — La DDR` }).catch(() => {});
      } else {
        await download();
        flash('Votre appareil ne permet pas le partage direct : l’image a été enregistrée.');
      }
    } catch {
      flash('Le partage a échoué. Essayez « Enregistrer ».');
    } finally {
      setBusy(false);
    }
  };

  // Sur petit écran, l'aperçu est réduit visuellement (l'image exportée garde sa pleine taille)
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 56) / W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const dark = style.mark === 'light';
  const big = format === 'story';

  return (
    <div style={rubriqueVars('studio')}>
      <RubriqueHero k="studio" icon={Palette} title="Studio Da’wa" subtitle="Créez en quelques secondes une belle carte de rappel, prête à partager sur WhatsApp, Facebook, Instagram ou TikTok." />

      <section className="relative z-10 -mt-10 pb-20">
        <Container className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid min-w-0 grid-cols-1 gap-4">
            <Step n={1} title="Le texte" icon={Type}>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {CATS.map((c) => (
                  <button key={c} onClick={() => { setCat(c); setCustom({ ...custom, on: false }); }} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${!custom.on && cat === c ? 'r-grad text-white' : 'bg-ivory-200 text-ink-800 hover:bg-ivory-300'}`}>{c}</button>
                ))}
                <button onClick={() => setCustom({ ...custom, on: true })} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${custom.on ? 'r-grad text-white' : 'bg-ivory-200 text-ink-800 hover:bg-ivory-300'}`}><PenLine className="h-4 w-4" /> Mon texte</button>
              </div>
              {custom.on ? (
                <div className="mt-4 grid gap-2">
                  <textarea value={custom.text} onChange={(e) => setCustom({ ...custom, text: e.target.value.slice(0, 220) })} rows={3} placeholder="Votre rappel (220 caractères maximum)" className="input" />
                  <input value={custom.source} onChange={(e) => setCustom({ ...custom, source: e.target.value.slice(0, 60) })} placeholder="Référence (facultatif) : ex. Coran 2:255" className="input" />
                  <p className="text-xs text-ink-500">Vérifiez toujours la source d’un verset ou d’un hadith avant de le partager.</p>
                </div>
              ) : (
                <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1">
                  {list.map((x) => (
                    <button key={x.source + x.french} onClick={() => setQuote(x)} className={`rounded-2xl border-2 p-3.5 text-left transition ${quote === x ? 'border-[var(--r-from)] bg-[var(--r-soft)]' : 'border-ink-900/[0.06] bg-ivory-50 hover:border-ink-900/15'}`}>
                      <span className="block text-right font-arabic text-xl text-ink-900" dir="rtl" lang="ar">{x.arabic}</span>
                      <span className="mt-1 block text-[15px] font-semibold text-ink-800">{x.french}</span>
                      <span className="r-ink text-xs font-bold">{x.source}</span>
                    </button>
                  ))}
                </div>
              )}
            </Step>

            <Step n={2} title="Le style" icon={Palette}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s)} aria-pressed={style.id === s.id} className={`overflow-hidden rounded-2xl text-xs font-bold transition ${style.id === s.id ? 'ring-4 ring-[var(--r-from)]' : 'ring-1 ring-ink-900/10 hover:-translate-y-0.5'}`}>
                    <span className="block h-14" style={{ background: s.bg }} />
                    <span className="block bg-white py-1.5 text-ink-800">{s.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {([['arabic', 'Arabe'], ['phonetic', 'Phonétique'], ['french', 'Français'], ['signature', 'Signature DDR']] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setShow({ ...show, [k]: !show[k] })} aria-pressed={show[k]} disabled={custom.on && (k === 'arabic' || k === 'phonetic')} className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-40 ${show[k] ? 'r-soft r-ink ring-1 ring-[var(--r-from)]' : 'bg-ivory-200 text-ink-500'}`}>
                    {show[k] ? '✓ ' : ''}{label}
                  </button>
                ))}
              </div>
            </Step>

            <Step n={3} title="Le format" icon={ImageIcon}>
              <div className="grid grid-cols-2 gap-2">
                {([['post', 'Publication', 'Carré · Facebook, Instagram', Square], ['story', 'Story / Statut', 'Vertical · WhatsApp, TikTok', Smartphone]] as const).map(([k, label, hint, Icon]) => (
                  <button key={k} onClick={() => setFormat(k)} aria-pressed={format === k} className={`flex items-center gap-3 rounded-2xl p-4 text-left transition ${format === k ? 'r-grad text-white shadow-lg' : 'bg-ivory-200 text-ink-800 hover:bg-ivory-300'}`}>
                    <Icon className="h-6 w-6 shrink-0" />
                    <span>
                      <span className="block font-bold">{label}</span>
                      <span className={`block text-xs ${format === k ? 'text-white/85' : 'text-ink-500'}`}>{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Step>
          </div>

          {/* Aperçu */}
          <aside className="reveal flex flex-col items-center lg:sticky lg:top-24">
            <div className="rounded-[1.6rem] bg-white p-3 shadow-[0_40px_80px_-40px_rgba(23,95,135,0.8)] ring-1 ring-ink-900/[0.06]">
              <div style={{ width: W * scale, height: H * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H }}>
              <div
                ref={cardRef}
                style={{ width: W, height: H, background: style.bg, color: style.text }}
                className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl px-8 text-center"
              >
                <div className="absolute inset-0" style={{ backgroundImage: dark ? PATTERN : PATTERN_DARK, backgroundSize: '60px 60px' }} />
                <div className="absolute inset-4 rounded-xl" style={{ border: `1px solid ${style.accent}55` }} />
                <div className="relative flex flex-col items-center">
                  <span className="mb-4 h-px w-16" style={{ background: style.accent }} />
                  {!custom.on && show.arabic && q.arabic && (
                    <p className={`font-arabic leading-relaxed ${big ? 'text-4xl' : q.arabic.length > 40 ? 'text-2xl' : 'text-3xl'}`} style={{ color: style.accent }} dir="rtl" lang="ar">{q.arabic}</p>
                  )}
                  {!custom.on && show.phonetic && q.phonetic && <p className={`mt-3 italic ${big ? 'text-base' : 'text-[13px]'}`} style={{ color: style.sub }}>{q.phonetic}</p>}
                  {(show.french || custom.on) && (
                    <p className={`mt-4 font-serif font-semibold leading-snug ${big ? 'text-[26px]' : q.french.length > 90 ? 'text-[17px]' : 'text-xl'}`}>{q.french}</p>
                  )}
                  {q.source && <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: style.accent }}>{q.source}</p>}
                  <span className="mt-4 h-px w-16" style={{ background: style.accent }} />
                </div>
                {show.signature && (
                  <div className="absolute bottom-7 left-0 right-0 flex items-center justify-center gap-2">
                    <LogoMark tone={style.mark} className="h-6 w-auto" />
                    <span className="text-[11px] font-bold" style={{ color: style.sub }}>La DDR · la-ddr.vercel.app</span>
                  </div>
                )}
              </div>
              </div>
              </div>
            </div>
            <div className="mt-4 grid w-full max-w-[384px] grid-cols-2 gap-2">
              <button onClick={share} disabled={busy} className="r-grad inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-bold text-white shadow-lg disabled:opacity-60"><Share2 className="h-5 w-5" /> Partager</button>
              <button onClick={download} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-900/15 bg-white px-5 py-3.5 font-bold text-ink-900 disabled:opacity-60"><Download className="h-5 w-5" /> {busy ? 'Création…' : 'Enregistrer'}</button>
            </div>
            {msg && <p role="status" className="mt-3 max-w-[384px] text-center text-sm font-semibold text-ink-700 animate-fade-up">{msg}</p>}
            <p className="mt-3 max-w-[384px] text-center text-xs text-ink-400">Image haute définition ({format === 'post' ? '1080 × 1080' : '1080 × 1920'} pixels).</p>
          </aside>
        </Container>
      </section>
    </div>
  );
};

export default StudioDawa;
