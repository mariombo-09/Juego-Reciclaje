import { create } from 'zustand';

export interface PlayerSkin {
  id: string;
  name: string;
  price: number;
  colors: {
    head: string;
    body: string;
    arms: string;
    legs: string;
    hair: string;
    eyes: string;
  };
  hasHat?: boolean;
  hatColor?: string;
}

export const AVAILABLE_SKINS: PlayerSkin[] = [
  {
    id: 'default',
    name: 'Clásico',
    price: 0,
    colors: {
      head: '#FFD8B5',
      body: '#FF6B6B',
      arms: '#FFD8B5',
      legs: '#4ECDC4',
      hair: '#8B4513',
      eyes: '#000000'
    }
  },
  {
    id: 'red',
    name: 'Rojo Fuego',
    price: 1500,
    colors: {
      head: '#FFD8B5',
      body: '#DC143C',
      arms: '#FFD8B5',
      legs: '#8B0000',
      hair: '#000000',
      eyes: '#000000'
    }
  },
  {
    id: 'blue',
    name: 'Azul Océano',
    price: 1800,
    colors: {
      head: '#FFD8B5',
      body: '#1E90FF',
      arms: '#FFD8B5',
      legs: '#00008B',
      hair: '#4169E1',
      eyes: '#000000'
    }
  },
  {
    id: 'green',
    name: 'Verde Bosque',
    price: 2000,
    colors: {
      head: '#FFD8B5',
      body: '#32CD32',
      arms: '#FFD8B5',
      legs: '#006400',
      hair: '#228B22',
      eyes: '#000000'
    }
  },
  {
    id: 'purple',
    name: 'Morado Místico',
    price: 2500,
    colors: {
      head: '#FFD8B5',
      body: '#9370DB',
      arms: '#FFD8B5',
      legs: '#4B0082',
      hair: '#8A2BE2',
      eyes: '#000000'
    }
  },
  {
    id: 'pink',
    name: 'Rosa Pastel',
    price: 3000,
    colors: {
      head: '#FFD8B5',
      body: '#FF69B4',
      arms: '#FFD8B5',
      legs: '#FF1493',
      hair: '#FFB6C1',
      eyes: '#000000'
    }
  },
  {
    id: 'summer',
    name: 'Modo Verano',
    price: 2200,
    colors: {
      head: '#D2691E',
      body: '#FFD700',
      arms: '#D2691E',
      legs: '#FF8C00',
      hair: '#FFA500',
      eyes: '#000000'
    }
  },
  {
    id: 'christmas',
    name: 'Papá Noel',
    price: 2800,
    colors: {
      head: '#FFD8B5',
      body: '#DC143C',
      arms: '#FFD8B5',
      legs: '#DC143C',
      hair: '#FFFFFF',
      eyes: '#000000'
    },
    hasHat: true,
    hatColor: '#DC143C'
  },
  {
    id: 'halloween',
    name: 'Halloween',
    price: 2500,
    colors: {
      head: '#FFD8B5',
      body: '#FF8C00',
      arms: '#FFD8B5',
      legs: '#000000',
      hair: '#4B0082',
      eyes: '#FF0000'
    }
  },
  {
    id: 'golden',
    name: 'Dorado Premium',
    price: 5000,
    colors: {
      head: '#FFD700',
      body: '#FFD700',
      arms: '#FFD700',
      legs: '#000000',
      hair: '#000000',
      eyes: '#000000'
    },
    hasHat: true,
    hatColor: '#000000'
  }
];

const SKINS_STORAGE_KEY = 'ecorunner_purchased_skins';
const CURRENT_SKIN_STORAGE_KEY = 'ecorunner_current_skin';

function loadPurchasedSkins(): string[] {
  try {
    const saved = localStorage.getItem(SKINS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : ['default'];
  } catch (error) {
    console.warn('Failed to load purchased skins:', error);
    return ['default'];
  }
}

function savePurchasedSkins(skins: string[]) {
  try {
    localStorage.setItem(SKINS_STORAGE_KEY, JSON.stringify(skins));
  } catch (error) {
    console.warn('Failed to save purchased skins:', error);
  }
}

function loadCurrentSkin(): string {
  try {
    const saved = localStorage.getItem(CURRENT_SKIN_STORAGE_KEY);
    return saved || 'default';
  } catch (error) {
    console.warn('Failed to load current skin:', error);
    return 'default';
  }
}

function saveCurrentSkin(skinId: string) {
  try {
    localStorage.setItem(CURRENT_SKIN_STORAGE_KEY, skinId);
  } catch (error) {
    console.warn('Failed to save current skin:', error);
  }
}

interface PlayerSkinsState {
  purchasedSkins: string[];
  currentSkinId: string;
  purchaseSkin: (skinId: string, currentCoins: number) => { success: boolean; newCoins: number };
  selectSkin: (skinId: string) => void;
  getCurrentSkin: () => PlayerSkin;
  isPurchased: (skinId: string) => boolean;
}

export const usePlayerSkins = create<PlayerSkinsState>((set, get) => ({
  purchasedSkins: loadPurchasedSkins(),
  currentSkinId: loadCurrentSkin(),

  purchaseSkin: (skinId: string, currentCoins: number) => {
    const skin = AVAILABLE_SKINS.find(s => s.id === skinId);
    if (!skin) {
      return { success: false, newCoins: currentCoins };
    }

    if (currentCoins < skin.price) {
      return { success: false, newCoins: currentCoins };
    }

    const { purchasedSkins } = get();
    if (purchasedSkins.includes(skinId)) {
      return { success: false, newCoins: currentCoins };
    }

    const newPurchasedSkins = [...purchasedSkins, skinId];
    const newCoins = currentCoins - skin.price;

    set({ purchasedSkins: newPurchasedSkins });
    savePurchasedSkins(newPurchasedSkins);

    return { success: true, newCoins };
  },

  selectSkin: (skinId: string) => {
    const { purchasedSkins } = get();
    if (purchasedSkins.includes(skinId)) {
      set({ currentSkinId: skinId });
      saveCurrentSkin(skinId);
    }
  },

  getCurrentSkin: () => {
    const { currentSkinId } = get();
    return AVAILABLE_SKINS.find(s => s.id === currentSkinId) || AVAILABLE_SKINS[0];
  },

  isPurchased: (skinId: string) => {
    const { purchasedSkins } = get();
    return purchasedSkins.includes(skinId);
  }
}));
