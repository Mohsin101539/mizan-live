export interface HadithRef {
  id: string;
  arabic: string;
}

export const HADITHS: HadithRef[] = [
  { id: "hadith_1", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ" },
  { id: "hadith_2", arabic: "خَيْرُكُمْ مَنْ أَحْسَنَ أَخْلَاقَهُ" },
  { id: "hadith_3", arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ" },
  { id: "hadith_4", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ" },
  { id: "ayah_1", arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا" }
];

export const getRandomHadith = (): HadithRef => {
  return HADITHS[Math.floor(Math.random() * HADITHS.length)];
};
