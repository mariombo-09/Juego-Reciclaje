import { create } from 'zustand';

export interface PowerUp {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  type: 'coin_multiplier' | 'lives';
  value: number;
  duration?: number;
}

export const AVAILABLE_POWERUPS: PowerUp[] = [
  {
    id: 'coin_2x',
    name: 'Monedas x2',
    price: 3000,
    description: 'Duplica las monedas ganadas durante 30 segundos',
    icon: '💰',
    type: 'coin_multiplier',
    value: 2,
    duration: 30000,
  },
  {
    id: 'coin_5x',
    name: 'Monedas x5',
    price: 8000,
    description: 'Multiplica por 5 las monedas ganadas durante 30 segundos',
    icon: '💎',
    type: 'coin_multiplier',
    value: 5,
    duration: 30000,
  },
  {
    id: 'extra_life',
    name: 'Vida Extra',
    price: 2000,
    description: 'Añade una vida extra al juego actual',
    icon: '❤️',
    type: 'lives',
    value: 1,
  },
];

interface ActivePowerUp {
  id: string;
  endTime: number;
  value: number;
}

interface PowerUpsState {
  activePowerUps: ActivePowerUp[];
  activatePowerUp: (powerUpId: string) => void;
  getCoinMultiplier: () => number;
  getActivePowerUps: () => PowerUp[];
  clearExpiredPowerUps: () => void;
  clearAllPowerUps: () => void;
}

export const usePowerUps = create<PowerUpsState>((set, get) => ({
  activePowerUps: [],

  activatePowerUp: (powerUpId: string) => {
    const powerUp = AVAILABLE_POWERUPS.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.type === 'lives') return;

    const endTime = Date.now() + (powerUp.duration || 0);
    
    set(state => ({
      activePowerUps: [
        ...state.activePowerUps.filter(p => p.id !== powerUpId),
        { id: powerUpId, endTime, value: powerUp.value }
      ]
    }));
  },

  getCoinMultiplier: () => {
    get().clearExpiredPowerUps();
    const multipliers = get().activePowerUps
      .filter(p => AVAILABLE_POWERUPS.find(pu => pu.id === p.id)?.type === 'coin_multiplier')
      .map(p => p.value);
    
    return multipliers.length > 0 ? Math.max(...multipliers) : 1;
  },

  getActivePowerUps: () => {
    get().clearExpiredPowerUps();
    return get().activePowerUps
      .map(ap => AVAILABLE_POWERUPS.find(p => p.id === ap.id))
      .filter(p => p !== undefined) as PowerUp[];
  },

  clearExpiredPowerUps: () => {
    const now = Date.now();
    set(state => ({
      activePowerUps: state.activePowerUps.filter(p => p.endTime > now)
    }));
  },

  clearAllPowerUps: () => {
    set({ activePowerUps: [] });
  }
}));
