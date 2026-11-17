// Contenus de l'Espace enfants (quiz et jeux). Facile à compléter : ajoutez une entrée à la liste.

export type QuizQuestion = { q: string; choices: string[]; answer: number; why: string; emoji: string };

export const QUIZ: QuizQuestion[] = [
  { emoji: '🕌', q: 'Combien y a-t-il de piliers de l’Islam ?', choices: ['3', '5', '7', '10'], answer: 1, why: 'La shahâda, la prière, la zakat, le jeûne du Ramadan et le pèlerinage (Hajj).' },
  { emoji: '📖', q: 'Quelle est la première sourate du Coran ?', choices: ['Al-Ikhlas', 'Al-Baqara', 'Al-Fâtiha', 'An-Nâs'], answer: 2, why: 'Al-Fâtiha, « l’Ouverture », est récitée dans chaque unité de prière.' },
  { emoji: '🧎', q: 'Combien de prières obligatoires fait-on chaque jour ?', choices: ['2', '3', '5', '6'], answer: 2, why: 'Fajr, Dhouhr, Asr, Maghrib et Icha.' },
  { emoji: '🌙', q: 'Pendant quel mois les musulmans jeûnent-ils ?', choices: ['Ramadan', 'Chawwal', 'Rajab', 'Mouharram'], answer: 0, why: 'Le jeûne du mois de Ramadan est le 4ᵉ pilier de l’Islam.' },
  { emoji: '✨', q: 'Quel ange a apporté le Coran au Prophète ﷺ ?', choices: ['Mikaïl', 'Jibril', 'Israfil', 'Malik'], answer: 1, why: 'L’ange Jibril (Gabriel) est venu au Prophète ﷺ dans la grotte de Hira.' },
  { emoji: '🏜️', q: 'Dans quelle ville est né le Prophète Muhammad ﷺ ?', choices: ['Médine', 'Jérusalem', 'Le Caire', 'La Mecque'], answer: 3, why: 'Il est né à La Mecque, puis il a émigré à Médine.' },
  { emoji: '🍽️', q: 'Que dit-on avant de manger ?', choices: ['Bismillah', 'Amine', 'Inch’Allah', 'Salam'], answer: 0, why: '« Bismillah » veut dire « Au nom d’Allah ».' },
  { emoji: '🤧', q: 'Que dit-on après avoir éternué ?', choices: ['Bismillah', 'Al-hamdoulillah', 'Astaghfiroullah', 'Allahou akbar'], answer: 1, why: 'On dit « Al-hamdoulillah » (louange à Allah), et on nous répond « Yarhamouka Llah ».' },
  { emoji: '🕋', q: 'Vers quel lieu les musulmans se tournent-ils pour prier ?', choices: ['La montagne Ouhoud', 'La Kaaba', 'La mosquée d’Abidjan', 'Le soleil'], answer: 1, why: 'La Kaaba, à La Mecque, est la direction de la prière (la qibla).' },
  { emoji: '🐋', q: 'Quel prophète a été avalé par un énorme poisson ?', choices: ['Moussa', 'Younous', 'Ibrahim', 'Issa'], answer: 1, why: 'Younous (Jonas) a invoqué Allah dans le ventre du poisson, et Allah l’a sauvé.' },
  { emoji: '⛵', q: 'Quel prophète a construit une grande arche ?', choices: ['Nouh', 'Soulayman', 'Daoud', 'Youssouf'], answer: 0, why: 'Nouh (Noé) a construit l’arche sur l’ordre d’Allah.' },
  { emoji: '🔢', q: 'Combien y a-t-il de sourates dans le Coran ?', choices: ['99', '100', '114', '120'], answer: 2, why: 'Le Coran contient 114 sourates.' },
  { emoji: '🌸', q: 'Comment s’appelle la mère du prophète Issa (Jésus) ?', choices: ['Khadija', 'Maryam', 'Aïcha', 'Fatima'], answer: 1, why: 'Maryam (Marie). Une sourate entière porte son nom.' },
  { emoji: '💧', q: 'Que fait-on avant la prière pour se purifier ?', choices: ['Les ablutions', 'Un repas', 'Une sieste', 'Une course'], answer: 0, why: 'Les ablutions (woudou) : on se lave les mains, la bouche, le nez, le visage, les bras, on passe les mains mouillées sur la tête, puis on lave les pieds.' },
  { emoji: '🌅', q: 'Quelle prière fait-on à l’aube, avant le lever du soleil ?', choices: ['Asr', 'Icha', 'Fajr', 'Maghrib'], answer: 2, why: 'Fajr est la prière de l’aube.' },
  { emoji: '👣', q: 'Qui est le premier homme et le premier prophète ?', choices: ['Adam', 'Ibrahim', 'Nouh', 'Moussa'], answer: 0, why: 'Adam, que la paix soit sur lui, est le père de l’humanité.' },
  { emoji: '🧳', q: 'Comment s’appelle le grand pèlerinage à La Mecque ?', choices: ['La Omra', 'Le Hajj', 'Le Tarawih', 'L’Aïd'], answer: 1, why: 'Le Hajj est le 5ᵉ pilier, à faire au moins une fois si on en a les moyens.' },
  { emoji: '🕊️', q: 'Que veut dire le mot « salâm » ?', choices: ['Merci', 'La paix', 'Bonjour', 'Au revoir'], answer: 1, why: '« As-salâmou alaykoum » : que la paix soit sur vous.' },
  { emoji: '🏙️', q: 'Dans quelle ville se trouve la mosquée du Prophète ﷺ ?', choices: ['La Mecque', 'Médine', 'Bagdad', 'Damas'], answer: 1, why: 'Al-Masjid an-Nabawi se trouve à Médine.' },
  { emoji: '⭐', q: 'Quelle est la plus courte sourate du Coran ?', choices: ['Al-Kawthar', 'Al-Fâtiha', 'Yâ-Sîn', 'Al-Moulk'], answer: 0, why: 'Al-Kawthar ne compte que 3 versets.' },
];

export const LETTERS = [
  { char: 'ا', name: 'Alif' }, { char: 'ب', name: 'Ba' }, { char: 'ت', name: 'Ta' }, { char: 'ث', name: 'Tha' },
  { char: 'ج', name: 'Jim' }, { char: 'خ', name: 'Kha' }, { char: 'د', name: 'Dal' }, { char: 'ر', name: 'Ra' },
  { char: 'س', name: 'Sin' }, { char: 'ش', name: 'Chin' }, { char: 'ع', name: 'Ayn' }, { char: 'ف', name: 'Fa' },
  { char: 'ق', name: 'Qaf' }, { char: 'ك', name: 'Kaf' }, { char: 'ل', name: 'Lam' }, { char: 'م', name: 'Mim' },
  { char: 'ن', name: 'Noun' }, { char: 'و', name: 'Waw' }, { char: 'ي', name: 'Ya' },
];

export const PRAYERS_ORDER = [
  { name: 'Fajr', hint: 'à l’aube', emoji: '🌅' },
  { name: 'Dhouhr', hint: 'à midi', emoji: '☀️' },
  { name: 'Asr', hint: 'l’après-midi', emoji: '🌤️' },
  { name: 'Maghrib', hint: 'au coucher du soleil', emoji: '🌇' },
  { name: 'Icha', hint: 'la nuit', emoji: '🌙' },
];

export const GOOD_DEEDS = [
  { id: 'bismillah', label: 'J’ai dit « Bismillah » avant de manger', emoji: '🍽️' },
  { id: 'prayer', label: 'J’ai fait ma prière (ou j’ai appris un geste)', emoji: '🧎' },
  { id: 'parents', label: 'J’ai aidé papa ou maman', emoji: '🤝' },
  { id: 'smile', label: 'J’ai souri à quelqu’un (c’est une aumône !)', emoji: '😊' },
  { id: 'quran', label: 'J’ai lu ou écouté un peu de Coran', emoji: '📖' },
  { id: 'share', label: 'J’ai partagé avec un ami', emoji: '🍬' },
];
