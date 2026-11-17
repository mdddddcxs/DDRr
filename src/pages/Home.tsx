
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_NEWS, MOCK_CONVERSIONS, SPEAKERS, SCHOOL_CAMPAIGN } from '../constants';
import { Link } from 'react-router-dom';
import { searchKnowledgeBaseStreamUnified } from '../services/geminiService';
import PrayerTimes from '../components/PrayerTimes';
import DonationModal from '../components/DonationModal';
import Logo from '../components/Logo';

const SUGGESTED_THEMES = [
  "Qui est Allah ?",
  "Jésus (Issa) dans le Coran",
  "Le but de la vie sur Terre",
  "La mort et l'après-vie",
  "Preuves de la prophétie de Muhammad",
  "La Bible et le Coran : Comparaison",
  "Pourquoi le mal existe-t-il ?",
  "La place de la femme en Islam",
  "Science et Coran",
  "Comment devenir musulman ?"
];

const DAILY_DUAS = [
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", fr: "Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l'au-delà; et protège-nous du châtiment du Feu." },
    { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", fr: "Seigneur, ouvre-moi ma poitrine et facilite ma mission." },
    { arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", fr: "Ô Allah, Tu es Pardonneur, Tu aimes le pardon, alors pardonne-moi." }
];

// --- SUB-COMPONENTS FOR PERFORMANCE (MEMOIZED) ---
const BackgroundEffects = React.memo(() => (
  <div className="fixed inset-0 pointer-events-none z-0">
      {/* Base noire profonde avec dégradé radial central pour la profondeur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000]"></div>
      
      {/* Texture subtile de haute qualité */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')] opacity-[0.02] mix-blend-overlay"></div>
      
      {/* Orbes de lumière animées (Simplifiées pour performance) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-yellow-600/5 rounded-full blur-[100px] animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
      
      {/* Vignettage pour focus central */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,#000000_85%)]"></div>
  </div>
));

const SearchResult = React.memo(({ displayedText, isTyping, resultContainerRef }: { displayedText: string; isTyping: boolean; resultContainerRef: React.RefObject<HTMLDivElement> }) => {
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
         return <li key={i} className="ml-6 mb-2 text-gray-300 list-disc marker:text-brand-500">{line.replace(/^[*-]\s/, '')}</li>;
      }
      if (line.trim().startsWith('###')) {
          return <h3 key={i} className="text-xl font-bold text-brand-400 mt-4 mb-2">{line.replace(/^###\s/, '')}</h3>
      }
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-3 leading-relaxed text-gray-200">
          {parts.map((part, j) => {
             if (part.startsWith('**') && part.endsWith('**')) {
                 return <strong key={j} className="text-brand-200 font-serif tracking-wide border-b border-brand-900/50">{part.slice(2, -2)}</strong>;
             }
             return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="mt-12 animate-fade-in-up max-w-3xl mx-auto">
        <div className="bg-[#101010] rounded-2xl border border-brand-900/50 overflow-hidden shadow-[0_0_80px_rgba(234,88,12,0.1)] transition-all duration-500 relative">
            {/* Decorative Top Border */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-yellow-500 to-brand-600"></div>
            
            <div className="px-8 py-6 flex items-center gap-4 border-b border-gray-800 bg-black/40">
                <div className="h-10 w-10 rounded-full bg-brand-900 flex items-center justify-center border border-brand-500/50 shadow-[0_0_15px_rgba(234,88,12,0.3)] shrink-0">
                    <span className="text-brand-500 text-sm">📖</span>
                </div>
                <div>
                    <span className="block font-bold text-gray-200">Le Compagnon DDR</span>
                    <span className="text-xs text-brand-500">Base de connaissances locale</span>
                </div>
            </div>
            
            <div className="p-8 md:p-10 text-gray-200 font-light text-lg min-h-[150px] max-h-[600px] overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" ref={resultContainerRef}>
                {formatText(displayedText)}
                {isTyping && <span className="inline-block w-2 h-5 ml-1 align-middle bg-brand-500 animate-pulse"></span>}
            </div>
        </div>
    </div>
  );
});

// --- MEMOIZED SECTIONS ---
const PrayerTimesSection = React.memo(() => (
  <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 text-center">Horaires de Prière</h2>
              <div className="h-1 w-24 bg-brand-500 rounded-full"></div>
          </div>
          <PrayerTimes />
      </div>
  </section>
));

const DonationSection = React.memo(({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="py-20 bg-brand-950/30 border-y border-brand-900/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-3xl border border-brand-500/20 shadow-2xl flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Soutenez la Da'wah</h2>
                  <p className="text-gray-400 text-lg mb-6">Votre contribution aide à maintenir nos programmes éducatifs et nos initiatives communautaires.</p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-2 text-brand-400">
                          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
                          <span>Projets Éducatifs</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-400">
                          <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
                          <span>Aide Humanitaire</span>
                      </div>
                  </div>
              </div>
              <button 
                  onClick={onOpenModal}
                  className="px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-95 shrink-0 group"
              >
                  Faire un Don <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
          </div>
      </div>
  </section>
));

const PrecheSection = React.memo(() => (
  <section id="preches" className="py-24 relative">
      <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
              <div>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Derniers Prêches</h2>
                  <p className="text-brand-500 font-medium tracking-widest uppercase text-sm">Sagesse & Guidance</p>
              </div>
              <Link to="/media" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-brand-500 transition-colors group">
                  Voir tout <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { title: "L'importance de la Patience", speaker: "Imam Cisse", date: "15 Mars 2024", duration: "45:20", image: "https://images.unsplash.com/photo-1584551270911-60ad677b39d0?auto=format&fit=crop&q=80&w=800" },
                  { title: "La Famille en Islam", speaker: "Cheick Traore", date: "12 Mars 2024", duration: "38:15", image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=800" },
                  { title: "Les Vertus du Ramadan", speaker: "Oustaz Kone", date: "10 Mars 2024", duration: "52:40", image: "https://images.unsplash.com/photo-1564760290292-23341e4df6ec?auto=format&fit=crop&q=80&w=800" }
              ].map((item, i) => (
                  <div key={i} className="group bg-[#0a0a0a] rounded-2xl overflow-hidden border border-gray-800 hover:border-brand-500/50 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                      <div className="relative h-48 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/10">
                              {item.duration}
                          </div>
                      </div>
                      <div className="p-6">
                          <div className="flex items-center gap-2 text-brand-500 text-xs font-bold uppercase tracking-tighter mb-2">
                              <span>{item.speaker}</span>
                              <span className="h-1 w-1 rounded-full bg-gray-600"></span>
                              <span className="text-gray-500">{item.date}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors">{item.title}</h3>
                          <button className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                              <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 group-hover:bg-brand-600 group-hover:border-brand-500 transition-all">
                                  <span className="text-[10px]">▶</span>
                              </div>
                              ÉCOUTER MAINTENANT
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  </section>
));

const SpeakersSection = React.memo(() => (
  <section className="py-24 bg-black/50 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Nos Intervenants</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Des savants et prédicateurs dévoués à partager la lumière de l'Islam.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
              {[
                  { name: "Imam Cisse", role: "Directeur Spirituel", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
                  { name: "Cheick Traore", role: "Conférencier", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
                  { name: "Oustaz Kone", role: "Enseignant", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
                  { name: "Dr. Diallo", role: "Chercheur", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400" }
              ].map((speaker, i) => (
                  <div key={i} className="group text-center">
                      <div className="relative mb-6 mx-auto w-32 h-32 md:w-48 md:h-48">
                          <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 scale-110 group-hover:scale-125 transition-transform duration-500 border-dashed"></div>
                          <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-900 shadow-2xl relative z-10">
                              <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                          </div>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-brand-500 transition-colors">{speaker.name}</h3>
                      <p className="text-brand-600 text-sm font-medium">{speaker.role}</p>
                  </div>
              ))}
          </div>
      </div>
  </section>
));

const NewsSection = React.memo(() => (
  <section id="actualites" className="py-24">
      <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
              <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Actualités & Événements</h2>
                  <p className="text-brand-500 font-bold tracking-widest uppercase text-sm">Restez Connectés</p>
              </div>
              <button className="px-8 py-3 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-brand-500 transition-all">
                  Toutes les actualités
              </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured News */}
              <div className="group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-gray-800">
                  <img src="https://images.unsplash.com/photo-1564760290292-23341e4df6ec?auto=format&fit=crop&q=80&w=1200" alt="Featured" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-12">
                      <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full mb-4">ÉVÉNEMENT À VENIR</span>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Grande Conférence Annuelle : La Lumière de la Foi</h3>
                      <p className="text-gray-300 mb-6 max-w-lg">Rejoignez-nous pour une journée d'inspiration, d'apprentissage et de fraternité avec des intervenants de renommée internationale.</p>
                      <div className="flex items-center gap-6 text-sm text-brand-400 font-bold">
                          <span>📅 25 AVRIL 2024</span>
                          <span>📍 MOSQUÉE CENTRALE</span>
                      </div>
                  </div>
              </div>
              
              {/* News List */}
              <div className="space-y-6">
                  {[
                      { title: "Nouveaux cours de Coran pour enfants", date: "18 Mars 2024", category: "Éducation" },
                      { title: "Distribution de kits alimentaires", date: "14 Mars 2024", category: "Social" },
                      { title: "Séminaire sur la finance islamique", date: "10 Mars 2024", category: "Économie" },
                      { title: "Rénovation de la bibliothèque", date: "05 Mars 2024", category: "Infrastructure" }
                  ].map((news, i) => (
                      <div key={i} className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-800">
                          <div className="h-20 w-20 md:h-24 md:w-24 rounded-xl bg-gray-900 flex-shrink-0 flex items-center justify-center text-2xl border border-gray-800 group-hover:border-brand-500/30 transition-all">
                              {i === 0 ? '📚' : i === 1 ? '🤝' : i === 2 ? '💰' : '🏗️'}
                          </div>
                          <div>
                              <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{news.category}</span>
                                  <span className="h-1 w-1 rounded-full bg-gray-700"></span>
                                  <span className="text-xs text-gray-500">{news.date}</span>
                              </div>
                              <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-400 transition-colors">{news.title}</h4>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  </section>
));

const CampaignSection = React.memo(({ onOpenModal }: { onOpenModal: () => void }) => (
  <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#0a0a0a] to-black rounded-[3rem] overflow-hidden border border-gray-800 shadow-2xl relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-10"></div>
              <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=800" alt="Construction" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:bg-gradient-to-l"></div>
                      <div className="absolute bottom-8 left-8 right-8">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse mb-2 inline-block tracking-widest uppercase">Urgence Chantier</span>
                          <h3 className="text-3xl font-bold text-white leading-none mb-1 font-serif">Mosquée & École</h3>
                          <p className="text-gray-300 text-sm flex items-center gap-1"><span className="text-brand-500">📍</span> Abidjan, Côte d'Ivoire</p>
                      </div>
                  </div>
                  <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-white mb-4">Construisons l'avenir de la <span className="text-brand-500">Oumma</span></h2>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                          La DDR construit actuellement un complexe éducatif pour former la jeunesse aux sciences et à la foi. 
                          Chaque brique posée est une <em>Sadaqa Jariya</em> pour vous. Nous avons besoin de ciment, de fer et de main d'œuvre.
                      </p>
                      
                      <div className="space-y-3 mb-10">
                          <div className="flex justify-between text-sm font-bold text-gray-300">
                              <span>Progression du chantier</span>
                              <span>{Math.round((SCHOOL_CAMPAIGN.currentAmount / SCHOOL_CAMPAIGN.targetAmount) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                              <div 
                                 className="bg-gradient-to-r from-brand-700 via-brand-500 to-yellow-500 h-full rounded-full relative shadow-[0_0_10px_rgba(234,88,12,0.5)]" 
                                 style={{ width: `${(SCHOOL_CAMPAIGN.currentAmount / SCHOOL_CAMPAIGN.targetAmount) * 100}%` }}
                              >
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
                              </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                              <span>Récolté: <span className="text-white">{SCHOOL_CAMPAIGN.currentAmount.toLocaleString()} F</span></span>
                              <span>Objectif: <span className="text-gray-400">{SCHOOL_CAMPAIGN.targetAmount.toLocaleString()} F</span></span>
                          </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                          <button onClick={onOpenModal} className="flex-1 bg-brand-600 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:bg-brand-500 hover:scale-[1.02] transition-all uppercase tracking-wider flex items-center justify-center gap-2">
                              <span className="text-xl">🙌</span> Faire un Don
                          </button>
                          <Link to="/donations" className="px-8 py-4 bg-white/5 border border-gray-700 rounded-xl text-gray-300 font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                              Voir la campagne
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>
));

const FicgayoSection = React.memo(() => (
  <section className="py-24 bg-gradient-to-b from-black to-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2 space-y-8">
                  <div>
                      <span className="inline-block py-1.5 px-4 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-500 text-xs font-bold tracking-[0.2em] uppercase mb-6">Rendez-vous Hebdomadaire</span>
                      <h2 className="text-4xl md:text-6xl font-extrabold text-white font-serif leading-tight">
                          Le Prêche du <span className="text-brand-500">Jeudi</span>
                      </h2>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed">
                      Chaque jeudi à <span className="text-white font-bold">16h00</span>, rejoignez-nous à la <span className="text-brand-500 font-bold">Place Ficgayo de Yopougon</span>. 
                      Un moment unique de partage, de questions-réponses et de rapprochement avec la vérité.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-[#0f0f0f] border border-gray-800 p-6 rounded-2xl">
                          <div className="text-brand-500 text-2xl mb-3">📍</div>
                          <h4 className="text-white font-bold mb-1">Lieu</h4>
                          <p className="text-gray-500 text-sm">Place Ficgayo, Yopougon, Abidjan</p>
                      </div>
                      <div className="bg-[#0f0f0f] border border-gray-800 p-6 rounded-2xl">
                          <div className="text-brand-500 text-2xl mb-3">⏰</div>
                          <h4 className="text-white font-bold mb-1">Heure</h4>
                          <p className="text-gray-500 text-sm">Tous les jeudis à 16h00 GMT</p>
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4">
                      <a href="https://www.youtube.com/@ddrlavraiechaine" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all flex items-center gap-3 shadow-lg shadow-red-600/20">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          Suivre en Direct
                      </a>
                      <Link to="/appointments" className="px-8 py-4 bg-white/5 border border-gray-700 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                          Poser une question
                      </Link>
                  </div>
              </div>
              <div className="w-full lg:w-1/2 relative">
                  <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl relative group">
                      <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1000&auto=format&fit=crop" alt="Prêche Ficgayo" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(234,88,12,0.5)]">
                              <svg className="w-10 h-10 text-white fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                      </div>
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -right-6 bg-[#121214] border border-gray-800 p-6 rounded-3xl shadow-2xl animate-bounce-slow">
                      <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                              {[1,2,3].map(i => (
                                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                  </div>
                              ))}
                          </div>
                          <div className="text-xs">
                              <span className="block font-bold text-white">Direct Live</span>
                              <span className="text-gray-500">Rejoignez 1.2k+ fidèles</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>
));

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const responseBuffer = useRef('');
  
  const [searching, setSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLFormElement>(null);
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Dua Carousel Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentDuaIndex((prev) => (prev + 1) % DAILY_DUAS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if ((isTyping || searching) && resultContainerRef.current) {
        const element = resultContainerRef.current;
        const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
        if (isNearBottom) {
            element.scrollTop = element.scrollHeight;
        }
    }
  }, [displayedText, isTyping, searching]);

  useEffect(() => {
    let intervalId: any;

    if (isTyping) {
        intervalId = setInterval(() => {
            setDisplayedText((current) => {
                const target = responseBuffer.current;
                
                if (current.length < target.length) {
                    const speed = (target.length - current.length) > 100 ? 8 : (target.length - current.length) > 50 ? 4 : 2;
                    return target.slice(0, current.length + speed);
                } else {
                    if (!searching) {
                        setIsTyping(false);
                    }
                    return current;
                }
            });
        }, 20);
    }

    return () => clearInterval(intervalId);
  }, [isTyping, searching]);

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryToUse = overrideQuery || searchQuery;
    if (!queryToUse.trim()) return;

    if (overrideQuery) setSearchQuery(overrideQuery);

    setSearching(true);
    setIsTyping(true); 
    setDisplayedText(""); 
    responseBuffer.current = ""; 
    setShowSuggestions(false);

    try {
      const stream = await searchKnowledgeBaseStreamUnified(queryToUse);
      
      for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
              responseBuffer.current += text;
          }
      }
    } catch (error) {
      console.error(error);
      responseBuffer.current += "\n\n(Une erreur est survenue lors de la consultation de la base de connaissances. Veuillez réessayer.)";
    } finally {
      setSearching(false); 
    }
  }, [searchQuery]);

  const scrollToSearch = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('search');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="bg-black text-gray-100 font-sans min-h-screen relative overflow-x-hidden">
      
      <BackgroundEffects />

      <div className="relative z-10">
        {/* --- HERO SECTION --- */}
        <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
               <div className="flex flex-col items-center text-center mb-16">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 relative"
                  >
                      <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full"></div>
                      <Logo className="h-24 md:h-32 relative z-10 drop-shadow-[0_0_30px_rgba(234,88,12,0.4)]" />
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-4xl md:text-7xl font-serif font-extrabold text-white mb-6 leading-tight tracking-tight"
                  >
                    La <span className="text-brand-500">DDR</span> : La Voie de la <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-yellow-500 to-brand-600">Vérité & Paix</span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                  >
                    Explorez la sagesse de l'Islam à travers le dialogue, la science et la fraternité. Votre compagnon spirituel intelligent vous guide.
                  </motion.p>

                  {/* Dua Carousel */}
                  <div className="w-full max-w-lg mx-auto mb-12 h-24 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                          <motion.div
                            key={currentDuaIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                          >
                              <p className="text-brand-500 font-arabic text-2xl mb-2">{DAILY_DUAS[currentDuaIndex].arabic}</p>
                              <p className="text-gray-500 text-sm italic">"{DAILY_DUAS[currentDuaIndex].fr}"</p>
                          </motion.div>
                      </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap justify-center gap-6">
                      <a href="#search" onClick={scrollToSearch} className="group relative px-8 py-4 bg-gradient-to-r from-brand-700 to-brand-600 rounded-full text-white font-bold shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_50px_rgba(234,88,12,0.5)] hover:scale-105 transition-all duration-300 overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 origin-left"></div>
                          <span className="relative flex items-center gap-3">
                              <span className="text-xl">📖</span> Consulter la base de savoir
                          </span>
                      </a>
                      <Link to="/debates" className="px-8 py-4 rounded-full border border-gray-600 bg-black/40 backdrop-blur-md text-gray-300 font-bold hover:text-white hover:border-brand-500 hover:bg-brand-900/10 transition duration-300">
                          Voir les débats
                      </Link>
                  </div>
               </div>

               {/* AI SEARCH BAR */}
               <form 
                  ref={suggestionsRef}
                  onSubmit={handleSearch} 
                  className="max-w-3xl mx-auto relative group"
               >
                  <div className="relative flex items-center">
                      <div className="absolute left-6 text-brand-500 group-focus-within:scale-110 transition-transform duration-300">
                          {searching ? (
                              <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          )}
                      </div>
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                        placeholder="Posez votre question sur l'Islam, la DDR..."
                        className="w-full bg-[#121212] border-2 border-brand-900/30 rounded-2xl py-6 pl-16 pr-32 text-white text-lg focus:outline-none focus:border-brand-500/50 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_60px_rgba(234,88,12,0.1)] placeholder:text-gray-600"
                      />
                      <button 
                        type="submit"
                        disabled={searching || !searchQuery.trim()}
                        className="absolute right-3 px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        DEMANDER
                      </button>
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                      {showSuggestions && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
                          >
                              <div className="p-2">
                                  {SUGGESTIONS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((s, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(s);
                                            setShowSuggestions(false);
                                            handleSearch(new Event('submit') as any, s);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-brand-900/20 text-gray-300 hover:text-brand-400 rounded-xl transition-colors flex items-center gap-3"
                                      >
                                          <span className="text-brand-500/50">#</span>
                                          {s}
                                      </button>
                                  ))}
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
               </form>

               {(displayedText || searching) && (
                   <SearchResult 
                      displayedText={displayedText} 
                      isTyping={isTyping} 
                      resultContainerRef={resultContainerRef} 
                   />
               )}
            </div>
        </div>

        {/* --- SECTIONS --- */}
        <PrayerTimesSection />
        <DonationSection onOpenModal={() => setShowDonationModal(true)} />
        <CampaignSection onOpenModal={() => setShowDonationModal(true)} />
        <FicgayoSection />
        <PrecheSection />
        <SpeakersSection />
        <NewsSection />

        {showDonationModal && <DonationModal onClose={() => setShowDonationModal(false)} />}
      </div>
    </div>
  );
};

export default Home;
