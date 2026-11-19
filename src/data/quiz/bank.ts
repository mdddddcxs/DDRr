// Questions rédigées à la main, chacune avec une courte explication.
// Format : [thème, niveau 1-3, question, bonne réponse, [3 mauvaises réponses], explication]
export type Theme = 'piliers' | 'priere' | 'coran' | 'prophetes' | 'sira' | 'jesus' | 'ethique' | 'arabe' | 'calendrier' | 'noms' | 'sourates';

export const THEMES: { key: Theme; label: string; emoji: string }[] = [
  { key: 'piliers', label: 'Piliers & foi', emoji: '🕋' },
  { key: 'priere', label: 'La prière', emoji: '🤲' },
  { key: 'coran', label: 'Le Coran', emoji: '📖' },
  { key: 'sourates', label: 'Les sourates', emoji: '✨' },
  { key: 'prophetes', label: 'Les prophètes', emoji: '🌿' },
  { key: 'sira', label: 'Vie du Prophète ﷺ', emoji: '🌙' },
  { key: 'jesus', label: 'Jésus dans l’Islam', emoji: '🕊️' },
  { key: 'ethique', label: 'Bon comportement', emoji: '💛' },
  { key: 'noms', label: 'Noms d’Allah', emoji: '💎' },
  { key: 'arabe', label: 'Lettres arabes', emoji: '✍️' },
  { key: 'calendrier', label: 'Calendrier hégirien', emoji: '📅' },
];

type Row = [Theme, 1 | 2 | 3, string, string, [string, string, string], string];

export const BANK: Row[] = [
  // Piliers & foi
  ['piliers', 1, 'Combien y a-t-il de piliers de l’Islam ?', 'Cinq', ['Trois', 'Six', 'Sept'], 'L’attestation de foi, la prière, l’aumône (zakat), le jeûne du Ramadan et le pèlerinage.'],
  ['piliers', 1, 'Quel est le premier pilier de l’Islam ?', 'L’attestation de foi (shahada)', ['La prière', 'Le jeûne', 'Le pèlerinage'], 'La shahada : attester qu’il n’y a de divinité qu’Allah et que Muhammad est Son messager.'],
  ['piliers', 1, 'Combien y a-t-il de piliers de la foi (îmân) ?', 'Six', ['Cinq', 'Quatre', 'Sept'], 'Croire en Allah, Ses anges, Ses livres, Ses messagers, le Jour dernier et le destin.'],
  ['piliers', 1, 'Comment s’appelle l’aumône obligatoire ?', 'La zakat', ['La sadaqa', 'La fidya', 'Le waqf'], 'La zakat est un pilier ; la sadaqa désigne l’aumône volontaire.'],
  ['piliers', 1, 'En quel mois les musulmans jeûnent-ils obligatoirement ?', 'Ramadan', ['Rajab', 'Cha‘bane', 'Mouharram'], 'Le jeûne du mois de Ramadan est le quatrième pilier de l’Islam.'],
  ['piliers', 1, 'Dans quelle ville se déroule le pèlerinage (hajj) ?', 'La Mecque', ['Médine', 'Jérusalem', 'Le Caire'], 'Le hajj se fait à La Mecque et dans ses environs (Mina, ‘Arafat, Mouzdalifa).'],
  ['piliers', 2, 'Quel est le taux habituel de la zakat sur l’argent épargné ?', '2,5 %', ['10 %', '5 %', '1 %'], 'Sur l’épargne qui atteint le seuil (nisâb) pendant une année lunaire, la zakat est de 2,5 %.'],
  ['piliers', 2, 'Comment appelle-t-on le pèlerinage facultatif, possible toute l’année ?', 'La ‘omra', ['Le hajj', 'L’i‘tikâf', 'La hijra'], 'La ‘omra peut s’accomplir à tout moment de l’année, contrairement au hajj.'],
  ['piliers', 2, 'Quel jour du hajj les pèlerins se tiennent-ils sur le mont ‘Arafat ?', 'Le 9 Dhou al-hijja', ['Le 1er Dhou al-hijja', 'Le 10 Mouharram', 'Le 27 Ramadan'], 'Le jour de ‘Arafat, le 9 Dhou al-hijja, est le cœur du pèlerinage.'],
  ['piliers', 2, 'Que signifie le mot « Islam » ?', 'La soumission à Dieu, dans la paix', ['La guerre sainte', 'La prière', 'Le livre'], 'Islam vient de la même racine que salâm, la paix : se remettre à Dieu en confiance.'],
  ['piliers', 3, 'Comment appelle-t-on la croyance en l’unicité absolue de Dieu ?', 'Le tawhîd', ['Le chirk', 'Le tafsîr', 'Le fiqh'], 'Le tawhîd est le cœur de l’Islam ; son contraire, associer à Dieu, s’appelle le chirk.'],
  ['piliers', 3, 'Quelle aumône est due à la fin du Ramadan, avant la prière de l’Aïd ?', 'La zakat al-fitr', ['La zakat al-mâl', 'La ‘aqîqa', 'La kaffâra'], 'La zakat al-fitr purifie le jeûneur et permet aux pauvres de fêter l’Aïd.'],

  // Prière
  ['priere', 1, 'Combien de prières obligatoires par jour ?', 'Cinq', ['Trois', 'Deux', 'Sept'], 'Fajr, Dhouhr, ‘Asr, Maghrib et ‘Icha.'],
  ['priere', 1, 'Vers quelle direction les musulmans prient-ils ?', 'La Kaaba, à La Mecque', ['Jérusalem', 'Le soleil levant', 'Médine'], 'Cette direction s’appelle la qibla.'],
  ['priere', 1, 'Comment s’appelle l’appel à la prière ?', 'L’adhân', ['L’iqâma', 'Le dhikr', 'Le khutba'], 'L’adhân annonce l’heure de la prière ; l’iqâma annonce qu’elle commence.'],
  ['priere', 1, 'Comment s’appellent les petites ablutions avant la prière ?', 'Le woudou', ['Le ghusl', 'Le tayammum', 'Le sujûd'], 'Le woudou purifie avant la prière ; le ghusl est le grand lavage du corps entier.'],
  ['priere', 1, 'Quel jour a lieu la grande prière collective hebdomadaire ?', 'Le vendredi', ['Le samedi', 'Le dimanche', 'Le jeudi'], 'La prière du vendredi (jumu‘a) remplace celle de Dhouhr et comporte un sermon.'],
  ['priere', 2, 'Que fait-on quand il n’y a pas d’eau pour les ablutions ?', 'Le tayammum, avec de la terre propre', ['On ne prie pas', 'On attend le lendemain', 'On se lave au parfum'], 'Le tayammum est une ablution sèche autorisée en l’absence d’eau ou en cas de maladie.'],
  ['priere', 2, 'Quelle sourate est récitée à chaque unité de prière ?', 'Al-Fâtiha', ['Al-Ikhlâs', 'Yâ-Sîn', 'Al-Baqara'], 'Sans Al-Fâtiha, l’unité de prière n’est pas valide selon la majorité des savants.'],
  ['priere', 2, 'Comment s’appelle la prosternation dans la prière ?', 'Le sujûd', ['Le rukû‘', 'Le qiyâm', 'Le tachahhud'], 'Le rukû‘ est l’inclinaison, le qiyâm la station debout, le sujûd la prosternation.'],
  ['priere', 2, 'Quelle prière nocturne est particulièrement pratiquée pendant le Ramadan ?', 'Les tarawih', ['Le witr de l’aube', 'La prière de l’éclipse', 'La prière des morts'], 'Les tarawih sont des prières surérogatoires accomplies les nuits de Ramadan.'],
  ['priere', 3, 'Par quelle parole commence la prière ?', 'Allâhou akbar', ['Bismillah', 'As-salâmou ‘alaykoum', 'Soubhânallah'], 'C’est le takbîr d’ouverture (takbîrat al-ihrâm). La prière se termine par le salâm.'],

  // Coran
  ['coran', 1, 'En quelle langue le Coran a-t-il été révélé ?', 'L’arabe', ['L’hébreu', 'L’araméen', 'Le persan'], 'Le Coran le dit lui-même : « Nous l’avons fait descendre, un Coran en arabe » (12:2).'],
  ['coran', 1, 'Combien de sourates compte le Coran ?', '114', ['99', '120', '30'], 'Le Coran compte 114 sourates, réparties en 30 parties (juz’).'],
  ['coran', 1, 'Quel ange a transmis le Coran au Prophète ﷺ ?', 'Jibrîl (Gabriel)', ['Mîkâ’îl (Michel)', 'Isrâfîl', 'Mâlik'], 'L’ange Jibrîl a transmis la révélation pendant environ 23 ans.'],
  ['coran', 1, 'Quel est le premier mot révélé du Coran ?', '« Iqra’ » (Lis !)', ['« Bismillah »', '« Qoul » (Dis !)', '« Alhamdoulillah »'], 'Les premiers versets révélés sont le début de la sourate Al-‘Alaq, dans la grotte de Hira.'],
  ['coran', 2, 'En combien de parties (juz’) le Coran est-il divisé ?', '30', ['60', '114', '7'], 'Cette division permet de lire tout le Coran en un mois, par exemple pendant le Ramadan.'],
  ['coran', 2, 'Comment s’appelle la nuit où le Coran a commencé à descendre ?', 'Laylat al-Qadr', ['Laylat al-Isrâ’', 'La nuit de ‘Arafat', 'La nuit de l’Aïd'], 'La Nuit du Destin, « meilleure que mille mois » (97:3), se situe dans les dix dernières nuits de Ramadan.'],
  ['coran', 2, 'Quelle est la plus longue sourate du Coran ?', 'Al-Baqara', ['Âl ‘Imrân', 'An-Nisâ’', 'Yâ-Sîn'], 'Al-Baqara compte 286 versets.'],
  ['coran', 2, 'Quelle est la plus courte sourate du Coran ?', 'Al-Kawthar', ['Al-Ikhlâs', 'An-Nâs', 'Al-Fâtiha'], 'Al-Kawthar ne compte que 3 versets, tout comme Al-‘Asr et An-Nasr, mais elle est la plus courte en nombre de mots.'],
  ['coran', 2, 'Quelle sourate ne commence pas par « Bismillah » ?', 'At-Tawba', ['Al-Fâtiha', 'Al-Baqara', 'Al-Mulk'], 'At-Tawba (sourate 9) est la seule sourate qui ne s’ouvre pas par la basmala.'],
  ['coran', 3, 'Quelle sourate contient deux fois la basmala ?', 'An-Naml', ['Al-Baqara', 'Al-Kahf', 'Maryam'], 'Au début de la sourate, et dans la lettre de Salomon à la reine de Saba (27:30).'],
  ['coran', 3, 'Comment s’appelle l’exégèse (explication) du Coran ?', 'Le tafsîr', ['Le tajwîd', 'Le hadîth', 'Le fiqh'], 'Le tajwîd est l’art de bien réciter ; le tafsîr, celui d’expliquer le sens.'],
  ['coran', 3, 'Quel compagnon a supervisé la compilation du Coran en un seul livre sous Abou Bakr ?', 'Zayd ibn Thâbit', ['Bilâl', 'Khâlid ibn al-Walîd', 'Salmân al-Fârisî'], 'Zayd ibn Thâbit, scribe de la révélation, a rassemblé les feuillets du Coran.'],

  // Prophètes
  ['prophetes', 1, 'Quel prophète a construit l’arche ?', 'Nûh (Noé)', ['Ibrâhîm (Abraham)', 'Mûsâ (Moïse)', 'Yûnus (Jonas)'], 'Nûh a construit l’arche sur ordre de Dieu avant le déluge.'],
  ['prophetes', 1, 'Quel prophète a été avalé par un grand poisson ?', 'Yûnus (Jonas)', ['Yûsuf (Joseph)', 'Ayyûb (Job)', 'Lût (Loth)'], 'Dans le ventre du poisson, il invoqua : « Pas de divinité à part Toi, gloire à Toi ! » (21:87).'],
  ['prophetes', 1, 'Qui a reconstruit la Kaaba avec son fils Ismâ‘îl ?', 'Ibrâhîm (Abraham)', ['Nûh (Noé)', 'Âdam', 'Dâwûd (David)'], 'Le Coran le rapporte en 2:127.'],
  ['prophetes', 1, 'Quel prophète fut jeté dans un puits par ses frères ?', 'Yûsuf (Joseph)', ['Ya‘qûb (Jacob)', 'Mûsâ (Moïse)', 'Hârûn (Aaron)'], 'Son histoire est racontée dans la sourate Yûsuf, « le plus beau des récits ».'],
  ['prophetes', 1, 'Qui est le premier homme et le premier prophète ?', 'Âdam', ['Nûh', 'Idrîs', 'Ibrâhîm'], 'Âdam, père de l’humanité, est aussi considéré comme le premier prophète.'],
  ['prophetes', 2, 'À quel prophète la Torah (Tawrât) a-t-elle été révélée ?', 'Mûsâ (Moïse)', ['Dâwûd (David)', '‘Îsâ (Jésus)', 'Ibrâhîm (Abraham)'], 'Le Coran cite la Torah, les Psaumes, l’Évangile et le Coran parmi les livres révélés.'],
  ['prophetes', 2, 'À quel prophète les Psaumes (Zabûr) ont-ils été donnés ?', 'Dâwûd (David)', ['Sulaymân (Salomon)', 'Mûsâ (Moïse)', 'Yahyâ (Jean-Baptiste)'], 'Le Coran le mentionne : « Et Nous avons donné le Zabûr à David » (4:163).'],
  ['prophetes', 2, 'Quel prophète comprenait le langage des oiseaux et des fourmis ?', 'Sulaymân (Salomon)', ['Dâwûd (David)', 'Nûh (Noé)', 'Sâlih'], 'Dans la sourate An-Naml, il entend une fourmi avertir les siennes.'],
  ['prophetes', 2, 'Quel prophète est célèbre pour sa patience dans la maladie ?', 'Ayyûb (Job)', ['Yûnus (Jonas)', 'Ya‘qûb (Jacob)', 'Zakariyyâ'], 'Ayyûb est resté patient et reconnaissant malgré de longues épreuves.'],
  ['prophetes', 2, 'Quel prophète fut envoyé au peuple de Thamoud, avec le miracle de la chamelle ?', 'Sâlih', ['Hûd', 'Chou‘ayb', 'Lût'], 'Hûd fut envoyé aux ‘Âd, Sâlih aux Thamoud.'],
  ['prophetes', 3, 'Quel prophète fut envoyé au peuple de ‘Âd ?', 'Hûd', ['Sâlih', 'Idrîs', 'Ilyâs'], 'Une sourate porte son nom : la sourate 11.'],
  ['prophetes', 3, 'Combien de prophètes sont cités nommément dans le Coran ?', '25', ['12', '40', '124'], 'Le Coran en nomme 25 ; il y en a eu beaucoup d’autres, envoyés à tous les peuples.'],
  ['prophetes', 3, 'Quel prophète est le père de Yahyâ (Jean-Baptiste) ?', 'Zakariyyâ (Zacharie)', ['‘Imrân', 'Ya‘qûb', 'Hârûn'], 'Zakariyyâ, âgé, pria pour un enfant et reçut la bonne nouvelle de Yahyâ (19:7).'],

  // Vie du Prophète
  ['sira', 1, 'Dans quelle ville est né le prophète Muhammad ﷺ ?', 'La Mecque', ['Médine', 'Jérusalem', 'Taïf'], 'Il est né à La Mecque vers l’an 570, l’« année de l’Éléphant ».'],
  ['sira', 1, 'Comment s’appelait la première épouse du Prophète ﷺ ?', 'Khadîja', ['‘Â’icha', 'Hafsa', 'Sawda'], 'Khadîja fut aussi la première personne à croire en son message.'],
  ['sira', 1, 'Comment s’appelle l’émigration de La Mecque vers Médine ?', 'L’hégire (hijra)', ['La ‘omra', 'L’isrâ’', 'Le jihad'], 'L’hégire, en 622, marque le début du calendrier musulman.'],
  ['sira', 1, 'À quel âge le Prophète ﷺ a-t-il reçu la première révélation ?', '40 ans', ['20 ans', '33 ans', '63 ans'], 'La révélation commença dans la grotte de Hira, près de La Mecque.'],
  ['sira', 2, 'Dans quelle grotte le Prophète ﷺ reçut-il la première révélation ?', 'La grotte de Hira', ['La grotte de Thawr', 'La grotte des Sept Dormants', 'Le mont Uhud'], 'Pendant l’hégire, il se cacha en revanche dans la grotte de Thawr.'],
  ['sira', 2, 'Qui était le compagnon du Prophète ﷺ pendant l’hégire ?', 'Abou Bakr', ['‘Omar', '‘Ali', '‘Othmân'], 'Abou Bakr deviendra le premier calife.'],
  ['sira', 2, 'Qui fut le premier muezzin de l’Islam ?', 'Bilâl ibn Rabâh', ['Zayd ibn Hâritha', 'Abou Hourayra', 'Anas ibn Mâlik'], 'Bilâl, ancien esclave affranchi, était choisi pour la beauté de sa voix.'],
  ['sira', 2, 'Comment s’appelle le voyage nocturne vers Jérusalem puis l’ascension ?', 'Al-Isrâ’ wal-Mi‘râj', ['Al-Hijra', 'Laylat al-Qadr', 'Hajj al-Wadâ‘'], 'C’est lors de ce voyage que les cinq prières ont été prescrites.'],
  ['sira', 3, 'Comment s’appelait le grand-père qui éleva le Prophète ﷺ après la mort de sa mère ?', '‘Abd al-Muttalib', ['Abou Tâlib', 'Abou Lahab', '‘Abbâs'], 'À la mort de ‘Abd al-Muttalib, son oncle Abou Tâlib le prit en charge.'],
  ['sira', 3, 'Comment s’appelle le dernier pèlerinage du Prophète ﷺ ?', 'Le pèlerinage d’adieu', ['Le pèlerinage de la victoire', 'La ‘omra de Hudaybiya', 'Le hajj de Tabouk'], 'Il y prononça un sermon célèbre sur l’égalité entre les êtres humains.'],

  // Jésus dans l'Islam
  ['jesus', 1, 'Comment s’appelle Jésus dans le Coran ?', '‘Îsâ', ['Yahyâ', 'Yûsuf', 'Ilyâs'], 'Le Coran l’appelle souvent ‘Îsâ ibn Maryam, Jésus fils de Marie.'],
  ['jesus', 1, 'Quelle sourate porte le nom de la mère de Jésus ?', 'Maryam', ['Âl ‘Imrân', 'An-Nisâ’', 'Al-Kahf'], 'La sourate 19, Maryam, raconte la naissance miraculeuse de Jésus.'],
  ['jesus', 1, 'Les musulmans croient-ils que Jésus est un prophète ?', 'Oui, un grand prophète et messager', ['Non', 'Seulement un sage', 'Seulement un roi'], 'Croire en Jésus comme prophète et messager fait partie de la foi musulmane.'],
  ['jesus', 2, 'Quel titre le Coran donne-t-il à Jésus ?', 'Al-Masîh (le Messie)', ['Al-Khalîl (l’ami intime)', 'Al-Kalîm (celui à qui Dieu a parlé)', 'Al-Amîn (le digne de confiance)'], 'Al-Khalîl désigne Ibrâhîm, Al-Kalîm désigne Mûsâ, Al-Amîn le prophète Muhammad ﷺ.'],
  ['jesus', 2, 'Selon le Coran, quel miracle Jésus fit-il au berceau ?', 'Il parla pour défendre sa mère', ['Il marcha', 'Il guérit un aveugle', 'Il fit pleuvoir'], 'Le Coran le rapporte dans la sourate Maryam (19:29-33).'],
  ['jesus', 2, 'Quel livre fut révélé à Jésus ?', 'L’Évangile (Injîl)', ['La Torah', 'Les Psaumes', 'Les feuillets d’Abraham'], 'Le Coran cite l’Injîl parmi les livres révélés par Dieu.'],
  ['jesus', 3, 'Qui est la seule femme nommée dans le Coran ?', 'Maryam (Marie)', ['Hawwâ’ (Ève)', 'Khadîja', 'Âsiya'], 'Marie est citée nommément plus de trente fois dans le Coran.'],
  ['jesus', 3, 'Selon le Coran, à quoi la création de Jésus est-elle comparée ?', 'À celle d’Âdam', ['À celle des anges', 'À celle de Nûh', 'À celle des étoiles'], '« Pour Dieu, Jésus est comme Âdam qu’Il créa de terre » (3:59).'],

  // Bon comportement
  ['ethique', 1, 'Que dit-on avant de manger ?', 'Bismillah', ['Alhamdoulillah', 'In shâ Allah', 'Astaghfiroullah'], 'Bismillah : « au nom d’Allah ». On dit Alhamdoulillah après le repas.'],
  ['ethique', 1, 'Que signifie « In shâ Allah » ?', 'Si Dieu le veut', ['Dieu est grand', 'Gloire à Dieu', 'Louange à Dieu'], 'On le dit en parlant d’une chose que l’on compte faire dans le futur.'],
  ['ethique', 1, 'Comment salue-t-on en Islam ?', 'As-salâmou ‘alaykoum', ['Bismillah', 'Allâhou akbar', 'Mâ shâ Allah'], '« Que la paix soit sur vous » ; on répond : wa ‘alaykoum as-salâm.'],
  ['ethique', 1, 'Que dit-on pour remercier Dieu ?', 'Alhamdoulillah', ['Astaghfiroullah', 'Soubhânallah', 'Lâ hawla'], 'Alhamdoulillah : « louange à Allah ».'],
  ['ethique', 2, 'Que signifie « Astaghfiroullah » ?', 'Je demande pardon à Allah', ['Allah est le plus grand', 'Gloire à Allah', 'Allah me suffit'], 'C’est une parole de repentir que le Prophète ﷺ répétait souvent.'],
  ['ethique', 2, 'Selon un hadith, le sourire envers ton frère est…', 'Une aumône', ['Une prière', 'Un devoir', 'Une faiblesse'], '« Ton sourire à ton frère est une aumône » (rapporté par At-Tirmidhî).'],
  ['ethique', 2, 'Sous les pieds de qui se trouve le Paradis, selon un hadith célèbre ?', 'Des mères', ['Des savants', 'Des rois', 'Des pèlerins'], 'Ce hadith souligne l’immense droit de la mère sur ses enfants.'],
  ['ethique', 3, 'Quelle qualité valut au Prophète ﷺ le surnom d’Al-Amîn avant la prophétie ?', 'Son honnêteté', ['Sa force', 'Sa richesse', 'Sa poésie'], 'Même ses adversaires lui confiaient leurs biens.'],

  // Calendrier
  ['calendrier', 1, 'Quelle fête marque la fin du Ramadan ?', 'L’Aïd al-Fitr', ['L’Aïd al-Adha', 'Le Mawlid', 'Achoura'], 'L’Aïd al-Fitr a lieu le 1er Chawwal.'],
  ['calendrier', 1, 'Quelle fête commémore le sacrifice d’Ibrâhîm ?', 'L’Aïd al-Adha', ['L’Aïd al-Fitr', 'Laylat al-Qadr', 'Le Nouvel An hégirien'], 'Elle a lieu le 10 Dhou al-hijja, pendant le pèlerinage.'],
  ['calendrier', 2, 'Le calendrier musulman est basé sur…', 'La lune', ['Le soleil', 'Les saisons', 'Les étoiles'], 'Chaque mois commence avec le nouveau croissant ; l’année lunaire compte environ 354 jours.'],
  ['calendrier', 2, 'Quel jour de Mouharram est le jour d’Achoura ?', 'Le 10', ['Le 1er', 'Le 15', 'Le 27'], 'Il est recommandé de jeûner ce jour, en souvenir du salut de Moïse et de son peuple.'],
  ['calendrier', 3, 'Quel événement marque l’an 1 du calendrier hégirien ?', 'L’émigration à Médine', ['La naissance du Prophète ﷺ', 'La première révélation', 'La conquête de La Mecque'], 'L’hégire de 622 a été choisie par le calife ‘Omar comme point de départ.'],
];
