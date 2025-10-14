import { useRecyclingGame } from '../lib/stores/useRecyclingGame';

export default function PauseButton() {
  const { gameState, togglePause } = useRecyclingGame();

  // Only show pause button during active gameplay or when paused
  if (gameState !== 'playing' && gameState !== 'paused' && gameState !== 'tutorial') {
    return null;
  }

  const isPaused = gameState === 'paused';

  return (
    <>
      {/* Pause button on the left side */}
      <button
        onClick={togglePause}
        className="fixed left-10 bottom-20 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg z-40 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isPaused ? '▶️' : '⏸️'}</span>
          <span className="text-sm">{isPaused ? 'REANUDAR' : 'PAUSA'}</span>
        </div>
      </button>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-md">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">⏸️ JUEGO PAUSADO</h2>
            <p className="text-lg text-gray-700 mb-6">
              El juego está en pausa. Haz clic en "Reanudar" para continuar jugando
            </p>
            <button
              onClick={togglePause}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl w-full transition-all"
            >
              ▶️ Reanudar Juego
            </button>
          </div>
        </div>
      )}
    </>
  );
}
