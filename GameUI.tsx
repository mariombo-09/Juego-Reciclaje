import { useRecyclingGame } from "../lib/stores/useRecyclingGame";

export default function GameUI() {
  const { 
    score, 
    lives, 
    coins,
    gameState, 
    startGame, 
    startTutorial,
    restartGame,
    classificationMessage,
    combo,
    currentTutorialStep,
    nextTutorialStep,
    completeTutorial,
    revivePlayer,
    canRevive,
    highScore
  } = useRecyclingGame();

  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md">
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            🌍 EcoRunner 🌍
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            ¡Ayuda a limpiar las calles clasificando la basura correctamente!
          </p>
          <div className="mb-6 text-left">
            <h3 className="font-bold text-lg mb-2">Controles:</h3>
            <p className="text-sm mb-1">← → : Cambiar carril</p>
            <p className="text-sm mb-1">Espacio: Saltar y clasificar</p>
            <p className="text-sm">R: Reiniciar</p>
          </div>
          <div className="mb-6 text-left">
            <h3 className="font-bold text-lg mb-2">Reciclaje Correcto:</h3>
            <p className="text-sm mb-1">🟡 Plástico (amarillo)</p>
            <p className="text-sm mb-1">🟢 Vidrio (verde)</p>
            <p className="text-sm mb-1">🟤 Orgánico (marrón)</p>
            <p className="text-sm">🔵 Papel (azul)</p>
          </div>
          <div className="mb-6 text-left">
            <h3 className="font-bold text-lg mb-2">Cómo Jugar:</h3>
            <p className="text-sm mb-1">• Muévete entre carriles con ← →</p>
            <p className="text-sm mb-1">• Colócate en el carril del cubo correcto</p>
            <p className="text-sm mb-1">• Salta con ESPACIO para clasificar</p>
            <p className="text-sm">• Evita chocar con la basura sin clasificar</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={startTutorial}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl w-full"
            >
              🎓 Tutorial
            </button>
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl w-full"
            >
              ¡Jugar Ahora!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'tutorial') {
    return (
      <>
        {/* Tutorial HUD - simplified */}
        <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-90 text-white p-4 rounded-lg z-10 max-w-md">
          <div className="text-lg font-bold mb-2">🎓 Tutorial EcoRunner</div>
          {currentTutorialStep && (
            <>
              <h3 className="text-lg font-bold mb-2">{currentTutorialStep.title}</h3>
              <p className="text-sm mb-3">{currentTutorialStep.description}</p>
              <p className="text-yellow-200 font-semibold">{currentTutorialStep.instruction}</p>
            </>
          )}
        </div>
        
        {/* Tutorial Controls */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg z-10">
          <button
            onClick={nextTutorialStep}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Continuar
          </button>
          <button
            onClick={completeTutorial}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Saltar Tutorial
          </button>
        </div>

        {/* Tutorial classification feedback */}
        {classificationMessage && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className={`text-2xl font-bold px-6 py-3 rounded-lg ${
              classificationMessage.includes('¡Correcto!') || classificationMessage.includes('¡Bien!') || classificationMessage.includes('¡Excelente!')
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {classificationMessage}
            </div>
          </div>
        )}
      </>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md">
          <h2 className="text-3xl font-bold text-red-600 mb-4">¡Juego Terminado!</h2>
          <p className="text-xl mb-2">Puntuación Final: {score}</p>
          <p className="text-lg mb-2">🏆 Récord: {highScore}</p>
          <p className="text-xl mb-4">💰 Monedas: {coins}</p>
          
          <div className="space-y-3">
            {canRevive() && (
              <button
                onClick={revivePlayer}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg w-full"
              >
                💖 Revivir (150 monedas)
              </button>
            )}
            
            <button
              onClick={restartGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
            >
              🔄 Jugar de Nuevo
            </button>
          </div>
          
          {!canRevive() && (
            <p className="text-sm text-gray-600 mt-3">
              Necesitas al menos 150 monedas para revivir
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg z-10">
        <div className="text-xl font-bold mb-2">Puntuación: {score}</div>
        <div className="text-lg mb-2">🏆 Récord: {highScore}</div>
        <div className="text-lg mb-2">Vidas: {'❤️'.repeat(lives)}</div>
        <div className="text-lg mb-2">💰 Monedas: {coins}</div>
        {combo > 1 && (
          <div className="text-yellow-400 text-lg font-bold">
            ¡Combo x{combo}!
          </div>
        )}
      </div>

      {/* Classification feedback */}
      {classificationMessage && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`text-3xl font-bold px-6 py-3 rounded-lg ${
            classificationMessage.includes('¡Correcto!') 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {classificationMessage}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-2 rounded text-sm z-10">
        Usa ← → para cambiar carril • ESPACIO para saltar y clasificar
      </div>
    </>
  );
}
