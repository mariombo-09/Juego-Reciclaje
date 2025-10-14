import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useRecyclingGame } from "./lib/stores/useRecyclingGame";
import { useGameThemes } from "./lib/stores/useGameThemes";
import Game from "./components/Game";
import GameUI from "./components/GameUI";
import WasteCard from "./components/WasteCard";
import SoundManager from "./components/SoundManager";
import Shop from "./components/Shop";
import PauseButton from "./components/PauseButton";
import "@fontsource/inter";

// WebGL detection utility
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not available, trying WebGL2...');
      const gl2 = canvas.getContext('webgl2');
      return !!gl2;
    }
    return true;
  } catch (e) {
    console.error('WebGL detection failed:', e);
    return false;
  }
}

// Define control keys for the recycling game
enum Controls {
  left = 'left',
  right = 'right',
  jump = 'jump',
  restart = 'restart'
}

const controls = [
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.restart, keys: ["KeyR"] }
];

// Main App component
function App() {
  const { gameState } = useRecyclingGame();
  const { getCurrentTheme } = useGameThemes();
  const theme = getCurrentTheme();
  const [showCanvas, setShowCanvas] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  // Check WebGL support and show the canvas once everything is loaded
  useEffect(() => {
    const isWebGLSupported = detectWebGL();
    console.log('WebGL supported:', isWebGLSupported);
    setWebglSupported(isWebGLSupported);
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: theme.background
    }}>
      {showCanvas && webglSupported && !canvasError && (
        <KeyboardControls map={controls}>
          <Canvas
            camera={{
              position: [0, 3, 8],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: false,
              powerPreference: "default",
              alpha: false,
              premultipliedAlpha: false,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
              stencil: false,
              depth: true
            }}
            onCreated={({ gl, scene, camera }) => {
              console.log('WebGL context created successfully');
              console.log('Three.js renderer:', gl);
              console.log('Scene objects:', scene.children.length);
            }}
            onError={(error) => {
              console.error('Canvas creation error:', error);
              setCanvasError('Canvas creation failed');
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
          
          <WasteCard />
          <GameUI />
          <SoundManager />
          <Shop />
          <PauseButton />
        </KeyboardControls>
      )}
      
      {/* WebGL fallback UI - show when WebGL not supported or Canvas error occurs */}
      {showCanvas && (!webglSupported || canvasError) && (
        <KeyboardControls map={controls}>
          {/* Fallback 2D game view */}
          <div className="w-full h-full relative bg-gradient-to-b from-blue-300 to-green-300">
            {/* Simple 2D representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white bg-opacity-90 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">🌍 EcoRunner - Modo Compatibilidad 🌍</h2>
                <p className="mb-4">Tu navegador no soporta WebGL, pero el juego sigue funcionando!</p>
                <p className="mb-2">🎮 Los controles siguen activos:</p>
                <div className="text-left inline-block">
                  <p>← → : Cambiar carril</p>
                  <p>Espacio: Saltar y clasificar</p>
                  <p>R: Reiniciar</p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {canvasError ? `Error: ${canvasError}` : 'WebGL no disponible'}
                </div>
              </div>
            </div>
          </div>
          <WasteCard />
          <GameUI />
          <SoundManager />
          <Shop />
          <PauseButton />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
