import { useGameThemes } from '../lib/stores/useGameThemes';

export default function Lights() {
  const { getCurrentTheme } = useGameThemes();
  const theme = getCurrentTheme();
  const lighting = theme.lighting;

  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      
      {/* Main directional light (sun/moon) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={lighting.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color={lighting.sunColor}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={lighting.fillIntensity}
        color={lighting.fillColor}
      />
      
      {/* Point light for additional atmosphere */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.5}
        distance={20}
        color="#FFA500"
      />
    </>
  );
}
