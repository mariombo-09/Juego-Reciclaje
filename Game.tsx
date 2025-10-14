import { useFrame, useThree } from "@react-three/fiber";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import Player from "./Player";
import RecyclingBins from "./RecyclingBins";
import InfiniteEnvironment from "./InfiniteEnvironment";
import Lights from "./Lights";

export default function Game() {
  const { camera } = useThree();
  const { 
    gameState, 
    updateGame, 
    playerPosition
  } = useRecyclingGame();

  useFrame((state, delta) => {
    // Update game logic
    if (gameState === 'playing' || gameState === 'tutorial') {
      updateGame(delta);
    }
    
    // Camera following logic
    if ((gameState === 'playing' || gameState === 'tutorial') && playerPosition) {
      // Smooth camera following with third-person view
      const targetCameraPosition = {
        x: playerPosition.x, // Follow player's lane position
        y: playerPosition.y + 4, // Camera above player
        z: playerPosition.z - 6 // Camera behind player
      };
      
      // Smooth camera movement
      const lerpFactor = 1 - Math.pow(0.01, delta); // Smooth interpolation
      camera.position.x += (targetCameraPosition.x - camera.position.x) * lerpFactor;
      camera.position.y += (targetCameraPosition.y - camera.position.y) * lerpFactor;
      camera.position.z += (targetCameraPosition.z - camera.position.z) * lerpFactor;
      
      // Camera looks at player position + slight forward offset
      camera.lookAt(playerPosition.x, playerPosition.y + 1, playerPosition.z + 2);
    }
  });

  return (
    <>
      <Lights />
      <InfiniteEnvironment />
      
      {(gameState === 'playing' || gameState === 'tutorial') && (
        <>
          <Player />
          <RecyclingBins />
        </>
      )}
    </>
  );
}
