export interface HadithData {
  text: string;
  source: string;
  grade?: string;
}

let cachedHadithList: HadithData[] = [];

async function loadLocalHadith(): Promise<HadithData[]> {
  if (cachedHadithList.length > 0) return cachedHadithList;
  
  try {
    const response = await fetch('/data/hadith-id.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    cachedHadithList = await response.json();
    return cachedHadithList;
  } catch (error) {
    console.error('Failed to load local hadith:', error);
    return [
      {
        text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        source: 'QS. Al-Fatihah: 2',
        grade: 'Sahih'
      }
    ];
  }
}

export async function getRandomHadith(): Promise<HadithData> {
  const hadithList = await loadLocalHadith();
  const randomIndex = Math.floor(Math.random() * hadithList.length);
  return hadithList[randomIndex];
}
