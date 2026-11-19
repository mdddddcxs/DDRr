// Données de référence du quiz. Toute modification doit garder les contrôles de
// scripts/check-quiz.mjs au vert (114 sourates, 6236 versets, 28 médinoises, 28 lettres…).

/** Les 114 sourates : numéro, nom translittéré, sens en français, nombre de versets (lecture Hafs), lieu de révélation. */
export type Surah = { n: number; name: string; fr: string; ayat: number; medine: boolean };

const MEDINE = new Set([2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110]);

const RAW: [string, string, number][] = [
  ['Al-Fâtiha', 'L’Ouverture', 7], ['Al-Baqara', 'La Vache', 286], ['Âl ‘Imrân', 'La Famille d’Imran', 200], ['An-Nisâ’', 'Les Femmes', 176],
  ['Al-Mâ’ida', 'La Table servie', 120], ['Al-An‘âm', 'Les Bestiaux', 165], ['Al-A‘râf', 'Les Murailles', 206], ['Al-Anfâl', 'Le Butin', 75],
  ['At-Tawba', 'Le Repentir', 129], ['Yûnus', 'Jonas', 109], ['Hûd', 'Houd', 123], ['Yûsuf', 'Joseph', 111],
  ['Ar-Ra‘d', 'Le Tonnerre', 43], ['Ibrâhîm', 'Abraham', 52], ['Al-Hijr', 'Al-Hijr', 99], ['An-Nahl', 'Les Abeilles', 128],
  ['Al-Isrâ’', 'Le Voyage nocturne', 111], ['Al-Kahf', 'La Caverne', 110], ['Maryam', 'Marie', 98], ['Tâ-Hâ', 'Tâ-Hâ', 135],
  ['Al-Anbiyâ’', 'Les Prophètes', 112], ['Al-Hajj', 'Le Pèlerinage', 78], ['Al-Mu’minûn', 'Les Croyants', 118], ['An-Nûr', 'La Lumière', 64],
  ['Al-Furqân', 'Le Discernement', 77], ['Ash-Shu‘arâ’', 'Les Poètes', 227], ['An-Naml', 'Les Fourmis', 93], ['Al-Qasas', 'Le Récit', 88],
  ['Al-‘Ankabût', 'L’Araignée', 69], ['Ar-Rûm', 'Les Romains', 60], ['Luqmân', 'Louqman', 34], ['As-Sajda', 'La Prosternation', 30],
  ['Al-Ahzâb', 'Les Coalisés', 73], ['Saba’', 'Saba', 54], ['Fâtir', 'Le Créateur', 45], ['Yâ-Sîn', 'Yâ-Sîn', 83],
  ['As-Sâffât', 'Les Rangés', 182], ['Sâd', 'Sâd', 88], ['Az-Zumar', 'Les Groupes', 75], ['Ghâfir', 'Le Pardonneur', 85],
  ['Fussilat', 'Les Versets détaillés', 54], ['Ash-Shûrâ', 'La Consultation', 53], ['Az-Zukhruf', 'L’Ornement', 89], ['Ad-Dukhân', 'La Fumée', 59],
  ['Al-Jâthiya', 'L’Agenouillée', 37], ['Al-Ahqâf', 'Al-Ahqâf', 35], ['Muhammad', 'Muhammad', 38], ['Al-Fath', 'La Victoire éclatante', 29],
  ['Al-Hujurât', 'Les Appartements', 18], ['Qâf', 'Qâf', 45], ['Adh-Dhâriyât', 'Qui éparpillent', 60], ['At-Tûr', 'Le Mont', 49],
  ['An-Najm', 'L’Étoile', 62], ['Al-Qamar', 'La Lune', 55], ['Ar-Rahmân', 'Le Tout Miséricordieux', 78], ['Al-Wâqi‘a', 'L’Événement', 96],
  ['Al-Hadîd', 'Le Fer', 29], ['Al-Mujâdala', 'La Discussion', 22], ['Al-Hashr', 'L’Exode', 24], ['Al-Mumtahana', 'L’Éprouvée', 13],
  ['As-Saff', 'Le Rang', 14], ['Al-Jumu‘a', 'Le Vendredi', 11], ['Al-Munâfiqûn', 'Les Hypocrites', 11], ['At-Taghâbun', 'La Grande Perte', 18],
  ['At-Talâq', 'Le Divorce', 12], ['At-Tahrîm', 'L’Interdiction', 12], ['Al-Mulk', 'La Royauté', 30], ['Al-Qalam', 'La Plume', 52],
  ['Al-Hâqqa', 'Celle qui montre la vérité', 52], ['Al-Ma‘ârij', 'Les Voies d’ascension', 44], ['Nûh', 'Noé', 28], ['Al-Jinn', 'Les Djinns', 28],
  ['Al-Muzzammil', 'L’Enveloppé', 20], ['Al-Muddaththir', 'Le Revêtu d’un manteau', 56], ['Al-Qiyâma', 'La Résurrection', 40], ['Al-Insân', 'L’Homme', 31],
  ['Al-Mursalât', 'Les Envoyés', 50], ['An-Naba’', 'La Nouvelle', 40], ['An-Nâzi‘ât', 'Les Anges qui arrachent les âmes', 46], ['‘Abasa', 'Il s’est renfrogné', 42],
  ['At-Takwîr', 'L’Obscurcissement', 29], ['Al-Infitâr', 'La Rupture', 19], ['Al-Mutaffifîn', 'Les Fraudeurs', 36], ['Al-Inshiqâq', 'La Déchirure', 25],
  ['Al-Burûj', 'Les Constellations', 22], ['At-Târiq', 'L’Astre nocturne', 17], ['Al-A‘lâ', 'Le Très-Haut', 19], ['Al-Ghâshiya', 'L’Enveloppante', 26],
  ['Al-Fajr', 'L’Aube', 30], ['Al-Balad', 'La Cité', 20], ['Ash-Shams', 'Le Soleil', 15], ['Al-Layl', 'La Nuit', 21],
  ['Ad-Duhâ', 'Le Jour montant', 11], ['Ash-Sharh', 'L’Ouverture de la poitrine', 8], ['At-Tîn', 'Le Figuier', 8], ['Al-‘Alaq', 'L’Adhérence', 19],
  ['Al-Qadr', 'La Destinée', 5], ['Al-Bayyina', 'La Preuve', 8], ['Az-Zalzala', 'La Secousse', 8], ['Al-‘Âdiyât', 'Les Coursiers', 11],
  ['Al-Qâri‘a', 'Le Fracas', 11], ['At-Takâthur', 'La Course aux richesses', 8], ['Al-‘Asr', 'Le Temps', 3], ['Al-Humaza', 'Les Calomniateurs', 9],
  ['Al-Fîl', 'L’Éléphant', 5], ['Quraysh', 'Qouraych', 4], ['Al-Mâ‘ûn', 'L’Ustensile', 7], ['Al-Kawthar', 'L’Abondance', 3],
  ['Al-Kâfirûn', 'Les Mécréants', 6], ['An-Nasr', 'Le Secours', 3], ['Al-Masad', 'Les Fibres', 5], ['Al-Ikhlâs', 'Le Monothéisme pur', 4],
  ['Al-Falaq', 'L’Aube naissante', 5], ['An-Nâs', 'Les Hommes', 6],
];

export const SURAHS: Surah[] = RAW.map(([name, fr, ayat], i) => ({ n: i + 1, name, fr, ayat, medine: MEDINE.has(i + 1) }));

/** Les 28 lettres de l'alphabet arabe, dans l'ordre. */
export const LETTERS: { ar: string; name: string }[] = [
  { ar: 'ا', name: 'Alif' }, { ar: 'ب', name: 'Bâ' }, { ar: 'ت', name: 'Tâ' }, { ar: 'ث', name: 'Thâ' }, { ar: 'ج', name: 'Jîm' },
  { ar: 'ح', name: 'Ḥâ' }, { ar: 'خ', name: 'Khâ' }, { ar: 'د', name: 'Dâl' }, { ar: 'ذ', name: 'Dhâl' }, { ar: 'ر', name: 'Râ' },
  { ar: 'ز', name: 'Zây' }, { ar: 'س', name: 'Sîn' }, { ar: 'ش', name: 'Chîn' }, { ar: 'ص', name: 'Ṣâd' }, { ar: 'ض', name: 'Ḍâd' },
  { ar: 'ط', name: 'Ṭâ' }, { ar: 'ظ', name: 'Ẓâ' }, { ar: 'ع', name: '‘Ayn' }, { ar: 'غ', name: 'Ghayn' }, { ar: 'ف', name: 'Fâ' },
  { ar: 'ق', name: 'Qâf' }, { ar: 'ك', name: 'Kâf' }, { ar: 'ل', name: 'Lâm' }, { ar: 'م', name: 'Mîm' }, { ar: 'ن', name: 'Noûn' },
  { ar: 'ه', name: 'Hâ' }, { ar: 'و', name: 'Wâw' }, { ar: 'ي', name: 'Yâ' },
];

/** Une sélection de beaux noms d'Allah (al-asmâ’ al-husnâ). */
export const NAMES: { ar: string; tr: string; fr: string }[] = [
  { ar: 'الرَّحْمَٰن', tr: 'Ar-Rahmân', fr: 'Le Tout Miséricordieux' },
  { ar: 'الرَّحِيم', tr: 'Ar-Rahîm', fr: 'Le Très Miséricordieux' },
  { ar: 'المَلِك', tr: 'Al-Malik', fr: 'Le Roi, le Souverain' },
  { ar: 'القُدُّوس', tr: 'Al-Quddûs', fr: 'Le Pur, le Saint' },
  { ar: 'السَّلَام', tr: 'As-Salâm', fr: 'La Paix, la Source de paix' },
  { ar: 'العَزِيز', tr: 'Al-‘Azîz', fr: 'Le Tout-Puissant' },
  { ar: 'الخَالِق', tr: 'Al-Khâliq', fr: 'Le Créateur' },
  { ar: 'الغَفَّار', tr: 'Al-Ghaffâr', fr: 'Celui qui pardonne sans cesse' },
  { ar: 'الرَّزَّاق', tr: 'Ar-Razzâq', fr: 'Celui qui accorde la subsistance' },
  { ar: 'العَلِيم', tr: 'Al-‘Alîm', fr: 'L’Omniscient' },
  { ar: 'السَّمِيع', tr: 'As-Samî‘', fr: 'Celui qui entend tout' },
  { ar: 'البَصِير', tr: 'Al-Basîr', fr: 'Celui qui voit tout' },
  { ar: 'الحَكِيم', tr: 'Al-Hakîm', fr: 'Le Sage' },
  { ar: 'الوَدُود', tr: 'Al-Wadûd', fr: 'Le Bien-Aimant' },
  { ar: 'الحَيّ', tr: 'Al-Hayy', fr: 'Le Vivant' },
  { ar: 'القَيُّوم', tr: 'Al-Qayyûm', fr: 'Celui qui subsiste par Lui-même' },
  { ar: 'الأَحَد', tr: 'Al-Ahad', fr: 'L’Unique' },
  { ar: 'الصَّمَد', tr: 'As-Samad', fr: 'L’Absolu, dont tout dépend' },
  { ar: 'الأَوَّل', tr: 'Al-Awwal', fr: 'Le Premier' },
  { ar: 'الآخِر', tr: 'Al-Âkhir', fr: 'Le Dernier' },
  { ar: 'اللَّطِيف', tr: 'Al-Latîf', fr: 'Le Subtil, le Bienveillant' },
  { ar: 'الكَرِيم', tr: 'Al-Karîm', fr: 'Le Généreux' },
  { ar: 'الوَهَّاب', tr: 'Al-Wahhâb', fr: 'Le Donateur généreux' },
  { ar: 'التَّوَّاب', tr: 'At-Tawwâb', fr: 'Celui qui accueille le repentir' },
  { ar: 'الهَادِي', tr: 'Al-Hâdî', fr: 'Le Guide' },
  { ar: 'النُّور', tr: 'An-Nûr', fr: 'La Lumière' },
  { ar: 'الشَّكُور', tr: 'Ash-Shakûr', fr: 'Le Reconnaissant' },
  { ar: 'الحَلِيم', tr: 'Al-Halîm', fr: 'Le Longanime, le Patient' },
  { ar: 'الفَتَّاح', tr: 'Al-Fattâh', fr: 'Celui qui ouvre les portes, le Juge' },
  { ar: 'الغَنِيّ', tr: 'Al-Ghaniyy', fr: 'Celui qui se suffit à Lui-même' },
];

/** Prophètes cités dans le Coran, avec leur nom français usuel. */
export const PROPHETS: { ar: string; fr: string }[] = [
  { ar: 'Âdam', fr: 'Adam' }, { ar: 'Nûh', fr: 'Noé' }, { ar: 'Ibrâhîm', fr: 'Abraham' }, { ar: 'Ismâ‘îl', fr: 'Ismaël' },
  { ar: 'Ishâq', fr: 'Isaac' }, { ar: 'Ya‘qûb', fr: 'Jacob' }, { ar: 'Yûsuf', fr: 'Joseph' }, { ar: 'Mûsâ', fr: 'Moïse' },
  { ar: 'Hârûn', fr: 'Aaron' }, { ar: 'Dâwûd', fr: 'David' }, { ar: 'Sulaymân', fr: 'Salomon' }, { ar: 'Ayyûb', fr: 'Job' },
  { ar: 'Yûnus', fr: 'Jonas' }, { ar: 'Ilyâs', fr: 'Élie' }, { ar: 'Al-Yasa‘', fr: 'Élisée' }, { ar: 'Zakariyyâ', fr: 'Zacharie' },
  { ar: 'Yahyâ', fr: 'Jean-Baptiste' }, { ar: '‘Îsâ', fr: 'Jésus' }, { ar: 'Lût', fr: 'Loth' }, { ar: 'Idrîs', fr: 'Hénoch' },
];

/** Les 12 mois du calendrier hégirien, dans l'ordre. */
export const MONTHS = [
  'Mouharram', 'Safar', 'Rabi‘ al-awwal', 'Rabi‘ ath-thani', 'Joumada al-oula', 'Joumada ath-thania',
  'Rajab', 'Cha‘bane', 'Ramadan', 'Chawwal', 'Dhou al-qi‘da', 'Dhou al-hijja',
];

/** Prières obligatoires et nombre d'unités (rak‘a). */
export const PRAYERS = [
  { name: 'Fajr (l’aube)', rakat: 2 },
  { name: 'Dhouhr (midi)', rakat: 4 },
  { name: '‘Asr (l’après-midi)', rakat: 4 },
  { name: 'Maghrib (le coucher du soleil)', rakat: 3 },
  { name: '‘Icha (la nuit)', rakat: 4 },
];
