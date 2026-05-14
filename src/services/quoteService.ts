export interface Quote {
  text: string;
  author: string;
}

export const ISLAMIC_QUOTES: Quote[] = [
  { text: "The best among you are those who have the best manners and character.", author: "Prophet Muhammad (ﷺ)" },
  { text: "Be like a flower that gives its fragrance even to the hand that crushes it.", author: "Ali ibn Abi Talib (RA)" },
  { text: "The heart that is full of Allah is never empty.", author: "Unknown" },
  { text: "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.", author: "Unknown" },
  { text: "Do not lose hope, nor be sad.", author: "Quran 3:139" },
  { text: "Verily, with hardship comes ease.", author: "Quran 94:6" },
  { text: "Allah does not burden a soul beyond that it can bear.", author: "Quran 2:286" },
  { text: "Kindness is a mark of faith, and whoever is not kind has no faith.", author: "Prophet Muhammad (ﷺ)" },
  { text: "He who has no compassion will receive no compassion.", author: "Prophet Muhammad (ﷺ)" },
  { text: "The most beloved of deeds to Allah are the most consistent ones, even if they are small.", author: "Prophet Muhammad (ﷺ)" },
  { text: "Speak a good word or remain silent.", author: "Prophet Muhammad (ﷺ)" },
  { text: "Be in this world as if you were a stranger or a traveler.", author: "Prophet Muhammad (ﷺ)" },
  { text: "Riches are not from an abundance of worldly goods, but from a contented mind.", author: "Prophet Muhammad (ﷺ)" },
  { text: "Focus on your own flaws and you won't have time to notice the flaws of others.", author: "Unknown" },
  { text: "Dua has the power to change your destiny.", author: "Unknown" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "The tongue is like a lion; if you let it loose, it will wound someone.", author: "Ali ibn Abi Talib (RA)" },
  { text: "A busy life makes prayer harder, but prayer makes a busy life easier.", author: "Unknown" },
  { text: "Knowledge without action is insanity, and action without knowledge is vanity.", author: "Imam Ghazali" },
  { text: "Gratitude is the key to abundance.", author: "Unknown" }
];

export const getRandomQuote = () => {
  return ISLAMIC_QUOTES[Math.floor(Math.random() * ISLAMIC_QUOTES.length)];
};
