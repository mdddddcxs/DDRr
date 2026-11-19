
import type { DonationCampaign, ProphetStory } from './types';


export const PROPHET_STORIES: ProphetStory[] = [
    {
        id: 'beginnings',
        title: "Le début de la Révélation",
        category: "Histoire",
        readTime: "3 min",
        source: "Sahih Al-Bukhari",
        content: `
**La Grotte de Hira**

Le Prophète (paix et bénédiction sur lui) aimait l'isolement. Il se retirait dans la grotte de Hira pour y adorer Allah pendant plusieurs nuits. 

C'est là, durant le mois de Ramadan, que l'Ange Jibril (Gabriel) lui apparut pour la première fois. L'ange lui dit : **"Lis !" (Iqra)**.
Le Prophète répondit : *"Je ne sais pas lire."*

L'ange le saisit et le pressa fort jusqu'à ce qu'il ne puisse plus supporter, puis le relâcha et dit : **"Lis !"**.
Il répondit encore : *"Je ne sais pas lire."*

Cela se produisit trois fois. Puis l'ange récita les premiers versets révélés du Coran :
> "Lis, au nom de ton Seigneur qui a créé, qui a créé l'homme d'une adhérence. Lis ! Ton Seigneur est le Très Noble..." (Sourate 96)

Le Prophète rentra chez lui, le cœur tremblant, auprès de son épouse Khadija (qu'Allah l'agrée), en disant : *"Couvrez-moi ! Couvrez-moi !"*.
        `
    },
    {
        id: 'taif',
        title: "La Miséricorde à Taif",
        category: "Miracle",
        readTime: "4 min",
        source: "Seerah Ibn Hisham",
        content: `
**L'épreuve la plus dure**

Après avoir été rejeté par les siens à la Mecque, le Prophète (paix et bénédiction sur lui) se rendit à Taif dans l'espoir de trouver du soutien. Mais les chefs de Taif se moquèrent de lui et envoyèrent les enfants et les esclaves pour lui jeter des pierres. Il saigna jusqu'à ce que ses sandales soient collées à ses pieds par le sang.

Il se réfugia dans un jardin, leva les mains vers le ciel et fit cette invocation poignante :
*"Ô Allah, je me plains à Toi de ma faiblesse, de mon manque de moyens et de mon humiliation devant les gens..."*

**L'Ange des Montagnes**

L'Ange Jibril apparut avec l'Ange des Montagnes et dit : *"Ô Muhammad ! Si tu le souhaites, je refermerai les deux montagnes sur eux (les habitants de Taif) pour les écraser."*

Malgré sa douleur et son humiliation, le Prophète, qui est une miséricorde pour l'univers, répondit :
> **"Non, j'espère plutôt qu'Allah fera sortir de leurs reins une descendance qui adorera Allah seul sans rien Lui associer."**

Et c'est ce qui arriva. Taif devint plus tard une ville musulmane.
        `
    },
    {
        id: 'cat',
        title: "Le Prophète et le Chat",
        category: "Sunnah",
        readTime: "2 min",
        source: "Hadith & Tradition",
        content: `
**La douceur envers les animaux**

Le Messager d'Allah (paix et bénédiction sur lui) a dit : *"Une femme est entrée en Enfer à cause d'une chatte qu'elle avait enfermée sans la nourrir ni la laisser manger les bêtes de la terre."*

On rapporte qu'un jour, le Prophète s'apprêtait à faire ses ablutions ou à prier, et il trouva un chat endormi sur le pan de son habit (Abaya).
Plutôt que de réveiller l'animal, il préféra **couper le morceau de tissu** de son habit pour ne pas déranger le sommeil du chat.

Cette histoire nous enseigne que la miséricorde en Islam s'étend à toutes les créatures vivantes.
        `
    },
    {
        id: 'smile',
        title: "Le Sourire du Prophète",
        category: "Sunnah",
        readTime: "2 min",
        source: "At-Tirmidhi",
        content: `
**Un visage rayonnant**

Abdullah ibn Al-Harith a dit : *"Je n'ai jamais vu quelqu'un sourire plus que le Messager d'Allah (paix et bénédiction sur lui)."*

Même dans les moments difficiles, son visage était apaisant pour ses compagnons. Il a enseigné :
> **"Sourire au visage de ton frère est une aumône (Sadaqa)."**

Le sourire n'est pas seulement une expression, c'est un acte d'adoration, une façon de répandre la paix et la positivité autour de soi, comme le faisait le meilleur des hommes.
        `
    },
    {
        id: 'date',
        title: "Le Tronc de Palmier qui pleure",
        category: "Miracle",
        readTime: "3 min",
        source: "Sahih Al-Bukhari",
        content: `
**La nostalgie d'un arbre**

Le Prophète (paix et bénédiction sur lui) avait l'habitude de s'appuyer contre un tronc de palmier lorsqu'il prononçait son sermon (Khutba) dans sa mosquée.
Lorsque la chaire (Minbar) fut construite pour qu'il soit plus visible, il délaissa le tronc pour monter sur le Minbar.

Soudain, toute la mosquée entendit un son déchirant, comme les pleurs d'un enfant ou le gémissement d'une chamelle. C'était le tronc de palmier qui pleurait la séparation d'avec le Prophète.

Le Prophète descendit du Minbar, alla vers le tronc et le serra contre lui jusqu'à ce qu'il se calme, comme on console un enfant.
Il dit : *"Il pleure à cause du Rappel (Dhikr) qu'il entendait près de lui."*
        `
    }
];

// Données de la campagne pour l'École
export const SCHOOL_CAMPAIGN: DonationCampaign = {
    id: 'ecole-science-foi',
    title: 'Grande Mosquée & École "Science & Foi"',
    description: "La DDR lance la construction d'un complexe éducatif islamique de référence à Abidjan. Cette école formera la future élite musulmane ivoirienne, alliant excellence académique et valeurs morales.",
    targetAmount: 50000000, // 50 Millions FCFA
    currentAmount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop',
    trustIndicators: [
        { icon: '🧱', title: 'Matériaux & Briques', text: 'Achat de ciment, fer et briques pour les fondations.' },
        { icon: '👷', title: 'Main d\'œuvre', text: 'Paiement des maçons et ouvriers sur le chantier.' },
        { icon: '📚', title: 'Futur des Enfants', text: 'Investissement pour la Oumma de demain.' }
    ]
};





export const COUNTRY_CODES = [
    { code: '+225', flag: '🇨🇮' },
    { code: '+33', flag: '🇫🇷' },
    { code: '+221', flag: '🇸🇳' },
    { code: '+223', flag: '🇲🇱' },
    { code: '+226', flag: '🇧🇫' },
    { code: '+229', flag: '🇧🇯' },
    { code: '+228', flag: '🇹🇬' },
    { code: '+212', flag: '🇲🇦' },
    { code: '+1', flag: '🇺🇸' },
    { code: '+44', flag: '🇬🇧' },
];

