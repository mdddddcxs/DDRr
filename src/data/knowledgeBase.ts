
export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: 'islam' | 'christianisme' | 'ddr' | 'general';
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: '1',
    question: "Qui est Allah ?",
    answer: "Allah est le nom propre de Dieu en arabe. Il est l'Unique, le Créateur de l'univers, sans associé ni enfant. Le Coran dit : 'Dis : Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n'a jamais engendré, n'a pas été engendré non plus. Et nul n'est égal à Lui.' (Sourate 112).",
    keywords: ['dieu', 'allah', 'unique', 'createur', 'monotheisme'],
    category: 'islam'
  },
  {
    id: '2',
    question: "Qui est Jésus (Issa) dans le Coran ?",
    answer: "Dans l'Islam, Jésus (Issa) est l'un des plus grands prophètes de Dieu. Il est né miraculeusement de la Vierge Marie (Maryam). Le Coran confirme ses miracles (guérir les aveugles, ressusciter les morts par la permission de Dieu), mais rejette l'idée qu'il soit le fils de Dieu ou Dieu lui-même. Il est un serviteur et un messager d'Allah.",
    keywords: ['jesus', 'issa', 'marie', 'maryam', 'prophete', 'fils de dieu'],
    category: 'islam'
  },
  {
    id: '3',
    question: "Quel est le but de la vie sur Terre ?",
    answer: "Le but de la vie, selon l'Islam, est d'adorer Dieu et de Le connaître. Allah dit dans le Coran : 'Je n'ai créé les djinns et les hommes que pour qu'ils M'adorent.' (Sourate 51, verset 56). Cette adoration englobe toutes les bonnes actions faites avec l'intention de plaire à Dieu.",
    keywords: ['but de la vie', 'adoration', 'existence', 'pourquoi'],
    category: 'islam'
  },
  {
    id: '4',
    question: "Comment devenir musulman ?",
    answer: "Pour devenir musulman, il suffit de prononcer la profession de foi (la Shahada) avec conviction : 'Ach-hadou an la ilaha illa Allah, wa ach-hadou anna Mouhammadan rassoulou Allah' (Je témoigne qu'il n'y a de divinité qu'Allah et que Muhammad est Son messager). C'est un engagement personnel entre vous et Dieu.",
    keywords: ['devenir musulman', 'shahada', 'conversion', 'comment'],
    category: 'islam'
  },
  {
    id: '5',
    question: "Qu'est-ce que la DDR ?",
    answer: "La DDR (Dawa Dans la Rue) est une association basée en Côte d'Ivoire, dirigée par Oustaz Diane. Son objectif est de propager le message de l'Islam à travers le dialogue interreligieux, la science et la sagesse, notamment par des débats publics et des prêches hebdomadaires.",
    keywords: ['ddr', 'association', 'dawa', 'oustaz diane', 'cote d\'ivoire'],
    category: 'ddr'
  },
  {
    id: '6',
    question: "Où se trouve le siège de la DDR ?",
    answer: "Le siège social de la DDR se situe à Yopougon Andokoi, en face du commissariat du 23ème Arrondissement, à Abidjan, Côte d'Ivoire.",
    keywords: ['siege', 'adresse', 'yopougon', 'abidjan', 'localisation'],
    category: 'ddr'
  },
  {
    id: '7',
    question: "Quand a lieu le prêche du jeudi ?",
    answer: "Le prêche de la DDR a lieu tous les jeudis à 16h00 GMT à la Place Ficgayo de Yopougon. C'est un moment ouvert à tous pour poser des questions et apprendre sur la religion.",
    keywords: ['preche', 'jeudi', 'ficgayo', 'heure', 'rendez-vous'],
    category: 'ddr'
  },
  {
    id: '8',
    question: "La Bible et le Coran : Comparaison",
    answer: "L'Islam enseigne que Dieu a révélé plusieurs livres, dont la Torah à Moïse, les Psaumes à David, l'Évangile à Jésus et le Coran à Muhammad. Le Coran est considéré comme le dernier message, confirmant les vérités précédentes et corrigeant les altérations humaines survenues au fil du temps.",
    keywords: ['bible', 'coran', 'evangile', 'torah', 'livres saints'],
    category: 'general'
  },
  {
    id: '9',
    question: "Pourquoi le mal existe-t-il ?",
    answer: "Le mal et la souffrance font partie de l'épreuve de la vie terrestre. Dieu nous a donné le libre arbitre pour choisir entre le bien et le mal. La patience face aux épreuves est une source de grande récompense dans l'au-delà. C'est aussi un moyen pour l'homme de reconnaître sa dépendance envers son Créateur.",
    keywords: ['mal', 'souffrance', 'epreuve', 'pourquoi le mal'],
    category: 'general'
  },
  {
    id: '10',
    question: "La place de la femme en Islam",
    answer: "En Islam, la femme et l'homme sont égaux devant Dieu en termes de spiritualité et de récompense. L'Islam a apporté des droits révolutionnaires aux femmes (héritage, propriété, choix du conjoint) à une époque où elles n'en avaient aucun. Le Prophète (psl) a dit : 'Le meilleur d'entre vous est celui qui est le meilleur avec sa femme.'",
    keywords: ['femme', 'droits', 'egalite', 'place de la femme'],
    category: 'islam'
  },
  {
    id: '11',
    question: "Science et Coran",
    answer: "Le Coran contient de nombreux versets faisant allusion à des phénomènes scientifiques découverts récemment (embryologie, expansion de l'univers, cycle de l'eau). L'Islam encourage la recherche du savoir et la science est vue comme un moyen de s'émerveiller devant la création d'Allah.",
    keywords: ['science', 'miracles', 'embryologie', 'univers'],
    category: 'islam'
  },
  {
    id: '12',
    question: "Qui est Muhammad (psl) ?",
    answer: "Muhammad (paix et salut sur lui) est le dernier messager d'Allah, né à la Mecque en 570. Il a reçu la révélation du Coran sur une période de 23 ans. Il est considéré comme le 'Sceau des Prophètes' et un modèle de comportement pour toute l'humanité.",
    keywords: ['muhammad', 'mahomet', 'prophete', 'messager'],
    category: 'islam'
  },
  {
    id: '13',
    question: "Qu'est-ce que la Trinité ?",
    answer: "Dans le dogme chrétien majoritaire, la Trinité est l'idée que Dieu est un en trois personnes : le Père, le Fils et le Saint-Esprit. L'Islam rejette strictement ce concept, prônant le Tawhid (l'Unicité pure de Dieu), affirmant que Dieu n'a pas d'associé.",
    keywords: ['trinite', 'christianisme', 'dogme', 'pere fils saint esprit'],
    category: 'christianisme'
  },
  {
    id: '14',
    question: "Les 5 piliers de l'Islam",
    answer: "Les 5 piliers sont : 1. La Shahada (foi), 2. La Salat (prière), 3. La Zakat (aumône), 4. Le Sawm (jeûne du Ramadan), 5. Le Hajj (pèlerinage à la Mecque). Ils constituent le fondement de la vie d'un musulman.",
    keywords: ['piliers', 'fondements', 'pratique', 'ramadan', 'priere'],
    category: 'islam'
  }
];
