import { useState } from 'react';
import { useRecyclingGame } from '../lib/stores/useRecyclingGame';
import { usePlayerSkins, AVAILABLE_SKINS } from '../lib/stores/usePlayerSkins';
import { usePromoCodes } from '../lib/stores/usePromoCodes';
import { useGameThemes, AVAILABLE_THEMES } from '../lib/stores/useGameThemes';
import { usePowerUps, AVAILABLE_POWERUPS } from '../lib/stores/usePowerUps';

export default function Shop() {
  const [isOpen, setIsOpen] = useState(false);
  const { coins, setCoins, lives } = useRecyclingGame();
  const { purchaseSkin, selectSkin, getCurrentSkin, isPurchased } = usePlayerSkins();
  const { redeemCode } = usePromoCodes();
  const { purchaseTheme, selectTheme, getCurrentTheme, isPurchased: isThemePurchased } = useGameThemes();
  const { activatePowerUp } = usePowerUps();
  const currentSkin = getCurrentSkin();
  const currentTheme = getCurrentTheme();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePurchase = (skinId: string) => {
    const result = purchaseSkin(skinId, coins);
    if (result.success) {
      // Update coins in the game store
      setCoins(result.newCoins);
      
      // Auto-select the purchased skin
      selectSkin(skinId);
    }
  };

  const handleRedeemCode = () => {
    if (!promoCode.trim()) {
      setPromoMessage({ text: 'Por favor ingresa un código', type: 'error' });
      setTimeout(() => setPromoMessage(null), 3000);
      return;
    }

    const result = redeemCode(promoCode);
    
    if (result.success) {
      setCoins(coins + result.coins);
      setPromoMessage({ text: result.message, type: 'success' });
      setPromoCode('');
    } else {
      setPromoMessage({ text: result.message, type: 'error' });
    }
    
    setTimeout(() => setPromoMessage(null), 3000);
  };

  const handlePurchaseTheme = (themeId: string) => {
    const result = purchaseTheme(themeId, coins);
    if (result.success) {
      setCoins(result.newCoins);
      selectTheme(themeId);
    }
  };

  const handlePurchasePowerUp = (powerUpId: string) => {
    const powerUp = AVAILABLE_POWERUPS.find(p => p.id === powerUpId);
    if (!powerUp) return;

    if (coins < powerUp.price) return;

    setCoins(coins - powerUp.price);
    
    if (powerUp.type === 'coin_multiplier') {
      activatePowerUp(powerUpId);
    } else if (powerUp.type === 'lives') {
      useRecyclingGame.setState({ lives: lives + powerUp.value });
    }
  };

  return (
    <>
      {/* Shop button on the right edge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-3 rounded-l-lg shadow-lg z-30 transition-all"
        style={{ borderRadius: '8px 0 0 8px' }}
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">🛒</span>
          <span className="text-xs">TIENDA</span>
        </div>
      </button>

      {/* Shop panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto">
          {/* Header with coins */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 sticky top-0 z-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-white">🛒 Tienda</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <p className="text-white text-lg font-semibold">💰 Tus Monedas</p>
              <p className="text-3xl font-bold text-white">{coins}</p>
            </div>
          </div>

          {/* Promo Codes Section */}
          <div className="p-4 border-b-4 border-yellow-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              🎁 Códigos Promocionales
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código de 24 dígitos"
                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 text-center font-mono text-sm"
                maxLength={24}
              />
              <button
                onClick={handleRedeemCode}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                🎉 Canjear Código
              </button>
              {promoMessage && (
                <div className={`p-2 rounded-lg text-center font-semibold text-sm ${
                  promoMessage.type === 'success' 
                    ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                }`}>
                  {promoMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Maps/Themes Section */}
          <div className="p-4 border-b-4 border-yellow-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🗺️ Mapas Temáticos</h3>
            <div className="space-y-3">
              {AVAILABLE_THEMES.map((theme) => {
                const purchased = isThemePurchased(theme.id);
                const isCurrentTheme = currentTheme.id === theme.id;
                const canAfford = coins >= theme.price;

                return (
                  <div
                    key={theme.id}
                    className={`border-2 rounded-lg p-3 transition-all ${
                      isCurrentTheme 
                        ? 'border-green-500 bg-green-50' 
                        : purchased 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{theme.name}</h3>
                        <p className="text-xs text-gray-600">{theme.description}</p>
                      </div>
                      <div className="text-right">
                        {theme.price === 0 ? (
                          <span className="text-green-600 font-bold text-sm">GRATIS</span>
                        ) : (
                          <span className="text-yellow-600 font-bold">{theme.price} 💰</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!purchased ? (
                        <button
                          onClick={() => handlePurchaseTheme(theme.id)}
                          disabled={!canAfford}
                          className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-all ${
                            canAfford
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '💳 Comprar' : '🔒 Bloqueado'}
                        </button>
                      ) : isCurrentTheme ? (
                        <button
                          disabled
                          className="flex-1 py-2 px-4 rounded font-semibold text-sm bg-green-500 text-white"
                        >
                          ✓ Equipado
                        </button>
                      ) : (
                        <button
                          onClick={() => selectTheme(theme.id)}
                          className="flex-1 py-2 px-4 rounded font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all"
                        >
                          🎨 Equipar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Power-ups Section */}
          <div className="p-4 border-b-4 border-yellow-200 bg-gradient-to-br from-orange-50 to-red-50">
            <h3 className="text-lg font-bold text-gray-800 mb-3">⚡ Bonus y Power-ups</h3>
            <div className="space-y-3">
              {AVAILABLE_POWERUPS.map((powerUp) => {
                const canAfford = coins >= powerUp.price;

                return (
                  <div
                    key={powerUp.id}
                    className="border-2 rounded-lg p-3 transition-all border-gray-200 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">
                          {powerUp.icon} {powerUp.name}
                        </h3>
                        <p className="text-xs text-gray-600">{powerUp.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-yellow-600 font-bold">{powerUp.price} 💰</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchasePowerUp(powerUp.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-4 rounded font-semibold text-sm transition-all ${
                        canAfford
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '💳 Comprar' : '🔒 Bloqueado'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skins grid */}
          <div className="p-4 space-y-3">
            {AVAILABLE_SKINS.map((skin) => {
              const purchased = isPurchased(skin.id);
              const isCurrentSkin = currentSkin.id === skin.id;
              const canAfford = coins >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={`border-2 rounded-lg p-3 transition-all ${
                    isCurrentSkin 
                      ? 'border-green-500 bg-green-50' 
                      : purchased 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{skin.name}</h3>
                      <div className="flex gap-1 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: skin.colors.body }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: skin.colors.legs }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: skin.colors.hair }}
                        />
                        {skin.hasHat && (
                          <span className="text-sm ml-1">🧢</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {skin.price === 0 ? (
                        <span className="text-green-600 font-bold text-sm">GRATIS</span>
                      ) : (
                        <span className="text-yellow-600 font-bold">{skin.price} 💰</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!purchased ? (
                      <button
                        onClick={() => handlePurchase(skin.id)}
                        disabled={!canAfford}
                        className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-all ${
                          canAfford
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '💳 Comprar' : '🔒 Bloqueado'}
                      </button>
                    ) : isCurrentSkin ? (
                      <button
                        disabled
                        className="flex-1 py-2 px-4 rounded font-semibold text-sm bg-green-500 text-white"
                      >
                        ✓ Equipado
                      </button>
                    ) : (
                      <button
                        onClick={() => selectSkin(skin.id)}
                        className="flex-1 py-2 px-4 rounded font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all"
                      >
                        👕 Equipar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
