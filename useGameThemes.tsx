import { create } from 'zustand';

export interface GameTheme {
  id: string;
  name: string;
  price: number;
  description: string;
  lighting: {
    ambientIntensity: number;
    ambientColor: string;
    sunIntensity: number;
    sunColor: string;
    fillIntensity: number;
    fillColor: string;
  };
  background: string;
  trashStyle: 'normal' | 'pumpkin' | 'gift';
  decorations: 'none' | 'webs' | 'snow';
}

export const AVAILABLE_THEMES: GameTheme[] = [
  {
    id: 'default',
    name: 'Normal',
    price: 0,
    description: 'El mapa clásico del juego',
    lighting: {
      ambientIntensity: 0.4,
      ambientColor: '#ffffff',
      sunIntensity: 1,
      sunColor: '#FFFACD',
      fillIntensity: 0.3,
      fillColor: '#87CEEB',
    },
    background: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
    trashStyle: 'normal',
    decorations: 'none',
  },
  {
    id: 'halloween',
    name: '🎃 Halloween',
    price: 5000,
    description: 'Mapa nocturno de Halloween con calabazas y telarañas',
    lighting: {
      ambientIntensity: 0.2,
      ambientColor: '#9966CC',
      sunIntensity: 0.3,
      sunColor: '#FF6600',
      fillIntensity: 0.4,
      fillColor: '#9966CC',
    },
    background: 'linear-gradient(to bottom, #1a0033, #330066)',
    trashStyle: 'pumpkin',
    decorations: 'webs',
  },
  {
    id: 'christmas',
    name: '🎄 Navidad',
    price: 7000,
    description: 'Mapa nevado de Navidad con regalos coloridos',
    lighting: {
      ambientIntensity: 0.5,
      ambientColor: '#E0F7FF',
      sunIntensity: 0.8,
      sunColor: '#FFFFFF',
      fillIntensity: 0.4,
      fillColor: '#B3E5FC',
    },
    background: 'linear-gradient(to bottom, #B3E5FC, #E1F5FE)',
    trashStyle: 'gift',
    decorations: 'snow',
  },
];

const THEME_STORAGE_KEY = 'ecorunner_themes';

function saveThemesToStorage(purchased: string[], current: string) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ purchased, current }));
  } catch (error) {
    console.warn('Failed to save themes to localStorage:', error);
  }
}

function loadThemesFromStorage(): { purchased: string[]; current: string } {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load themes from localStorage:', error);
  }
  return { purchased: ['default'], current: 'default' };
}

interface GameThemesState {
  purchasedThemes: string[];
  currentTheme: string;
  purchaseTheme: (themeId: string, coins: number) => { success: boolean; newCoins: number };
  selectTheme: (themeId: string) => void;
  getCurrentTheme: () => GameTheme;
  isPurchased: (themeId: string) => boolean;
}

export const useGameThemes = create<GameThemesState>((set, get) => {
  const { purchased, current } = loadThemesFromStorage();
  
  return {
    purchasedThemes: purchased,
    currentTheme: current,

    purchaseTheme: (themeId: string, coins: number) => {
      const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
      if (!theme) {
        return { success: false, newCoins: coins };
      }

      if (get().purchasedThemes.includes(themeId)) {
        return { success: false, newCoins: coins };
      }

      if (coins < theme.price) {
        return { success: false, newCoins: coins };
      }

      const newCoins = coins - theme.price;
      const newPurchased = [...get().purchasedThemes, themeId];
      
      set({ purchasedThemes: newPurchased });
      saveThemesToStorage(newPurchased, get().currentTheme);

      return { success: true, newCoins };
    },

    selectTheme: (themeId: string) => {
      if (!get().purchasedThemes.includes(themeId)) {
        return;
      }
      
      set({ currentTheme: themeId });
      saveThemesToStorage(get().purchasedThemes, themeId);
    },

    getCurrentTheme: () => {
      const theme = AVAILABLE_THEMES.find(t => t.id === get().currentTheme);
      return theme || AVAILABLE_THEMES[0];
    },

    isPurchased: (themeId: string) => {
      return get().purchasedThemes.includes(themeId);
    }
  };
});
