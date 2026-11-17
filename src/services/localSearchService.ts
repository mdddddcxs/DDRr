
import { KNOWLEDGE_BASE, KnowledgeEntry } from '../data/knowledgeBase';

/**
 * Recherche locale dans la base de connaissances DDR.
 * Cette solution est simple, efficace et fonctionne sans clé API.
 */
export const searchKnowledgeBaseLocal = async (query: string): Promise<KnowledgeEntry[]> => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  // Recherche par mots-clés et contenu
  const results = KNOWLEDGE_BASE.filter(entry => {
    const inQuestion = entry.question.toLowerCase().includes(normalizedQuery);
    const inAnswer = entry.answer.toLowerCase().includes(normalizedQuery);
    const inKeywords = entry.keywords.some(kw => kw.toLowerCase().includes(normalizedQuery));
    
    return inQuestion || inAnswer || inKeywords;
  });

  // Trier par pertinence (question > mots-clés > contenu)
  return results.sort((a, b) => {
    const aInQuestion = a.question.toLowerCase().includes(normalizedQuery) ? 2 : 0;
    const bInQuestion = b.question.toLowerCase().includes(normalizedQuery) ? 2 : 0;
    
    const aInKeywords = a.keywords.some(kw => kw.toLowerCase().includes(normalizedQuery)) ? 1 : 0;
    const bInKeywords = b.keywords.some(kw => kw.toLowerCase().includes(normalizedQuery)) ? 1 : 0;
    
    return (bInQuestion + bInKeywords) - (aInQuestion + aInKeywords);
  });
};

/**
 * Simule un flux de réponse (streaming) pour garder l'effet "intelligent"
 */
export async function* searchKnowledgeBaseStreamLocal(query: string) {
  const results = await searchKnowledgeBaseLocal(query);
  
  let responseText = "";
  
  if (results.length > 0) {
    const bestMatch = results[0];
    responseText = `**Question : ${bestMatch.question}**\n\n${bestMatch.answer}`;
    
    if (results.length > 1) {
        responseText += "\n\n### Autres sujets liés :\n";
        results.slice(1, 4).forEach(r => {
            responseText += `* ${r.question}\n`;
        });
    }
  } else {
    responseText = "Désolé, je n'ai pas trouvé de réponse précise à votre question dans ma base de connaissances actuelle. \n\nN'hésitez pas à venir nous poser votre question en direct lors du **Prêche du Jeudi à 16h à Ficgayo**, ou contactez-nous via la page de contact.";
  }

  // Simuler le streaming par morceaux de texte
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + ' ';
    yield { text: chunk };
    // Petit délai pour l'effet visuel
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}
