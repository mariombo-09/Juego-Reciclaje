import { create } from 'zustand';

export interface PromoCode {
  code: string;
  coins: number;
  used: boolean;
}

const PROMO_CODES_STORAGE_KEY = 'ecorunner_promo_codes';

function savePromoCodestoStorage(codes: PromoCode[]) {
  try {
    localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(codes));
  } catch (error) {
    console.warn('Failed to save promo codes to localStorage:', error);
  }
}

function loadPromoCodesFromStorage(): PromoCode[] {
  try {
    const saved = localStorage.getItem(PROMO_CODES_STORAGE_KEY);
    if (saved) {
      const codes = JSON.parse(saved);
      const allValid = codes.every((code: PromoCode) => code.code.length === 24);
      if (allValid) {
        return codes;
      }
      console.warn('Stored promo codes have invalid length, resetting to defaults');
    }
  } catch (error) {
    console.warn('Failed to load promo codes from localStorage:', error);
  }
  return getDefaultPromoCodes();
}

function getDefaultPromoCodes(): PromoCode[] {
  return [
    // Códigos para 10,000 monedas (24 caracteres cada uno)
    { code: 'CARLASANCHEZLANCHARES009', coins: 10000, used: false },
    { code: 'RUN10KHJKL23456MNOPQRST0', coins: 10000, used: false },
    { code: 'TRY10KTUVW89012XYZ345678', coins: 10000, used: false },
    { code: 'WIN10K7ABCDEFGHIJKLMNOPQ', coins: 10000, used: false },
    { code: 'PLY10KPQRSTUVW90123XYZAB', coins: 10000, used: false },
    { code: 'CARLASANCHEZLANCHARES000', coins: 100000, used: false },
    
    // Códigos para 20,000 monedas (24 caracteres cada uno)
    { code: 'ECO20K45678ABCDEFGHIJKLM', coins: 20000, used: false },
    { code: 'RUN20KLMNOPQRS1234TUVWXY', coins: 20000, used: false },
    { code: 'TRY20K56789XYZABCDEFGHIJ', coins: 20000, used: false },
    { code: 'WIN20KIJKLMNOPQRST012345', coins: 20000, used: false },
    { code: 'PLY20KUVWX456789YZABCDEF', coins: 20000, used: false },
    
    // Códigos para 50,000 monedas (24 caracteres cada uno)
    { code: 'ECO50KMEGA9876XABCZYXWVU', coins: 50000, used: false },
    { code: 'RUN50KGOLD54321DEFGHIJKL', coins: 50000, used: false },
    { code: 'TRY50KKINGLMNOPQRS890123', coins: 50000, used: false },
    { code: 'WIN50KSTARTUVW23456XYZMN', coins: 50000, used: false },
    { code: 'PLY50KHERO7ABCDEFGHIJKLM', coins: 50000, used: false },
  ];
}

interface PromoCodeState {
  promoCodes: PromoCode[];
  redeemCode: (code: string) => { success: boolean; coins: number; message: string };
}

export const usePromoCodes = create<PromoCodeState>((set, get) => ({
  promoCodes: loadPromoCodesFromStorage(),

  redeemCode: (inputCode: string) => {
    const { promoCodes } = get();
    const normalizedInput = inputCode.trim().toUpperCase();
    
    const codeIndex = promoCodes.findIndex(
      (pc) => pc.code.toUpperCase() === normalizedInput
    );

    if (codeIndex === -1) {
      return {
        success: false,
        coins: 0,
        message: 'Código inválido o no existe'
      };
    }

    const promoCode = promoCodes[codeIndex];

    if (promoCode.used) {
      return {
        success: false,
        coins: 0,
        message: 'Este código ya ha sido utilizado'
      };
    }

    const updatedCodes = [...promoCodes];
    updatedCodes[codeIndex] = { ...promoCode, used: true };
    
    set({ promoCodes: updatedCodes });
    savePromoCodestoStorage(updatedCodes);

    return {
      success: true,
      coins: promoCode.coins,
      message: `¡${promoCode.coins.toLocaleString()} monedas añadidas!`
    };
  }
}));
