import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import { TrashObstacle as TrashObstacleType } from "../types/game";
import { useGameThemes } from "../lib/stores/useGameThemes";

interface Props {
  obstacle: TrashObstacleType;
}

export default function TrashObstacle({ obstacle }: Props) {
  const meshRef = useRef<Mesh>(null);
  const { gameSpeed, removeObstacle } = useRecyclingGame();
  const { getCurrentTheme } = useGameThemes();
  const theme = getCurrentTheme();

  // Pre-calculate colors and shapes based on trash type and theme
  const { color, geometry, renderType } = useMemo(() => {
    const trashStyle = theme.trashStyle;
    
    if (trashStyle === 'pumpkin') {
      const pumpkinColors = ['#FF6600', '#FF8C00', '#FFA500', '#FF4500'];
      const colorIndex = obstacle.id % pumpkinColors.length;
      return { 
        color: pumpkinColors[colorIndex], 
        geometry: [0.5, 0.5, 0.5] as [number, number, number],
        renderType: 'pumpkin' as const
      };
    }
    
    if (trashStyle === 'gift') {
      const giftColors = ['#FF1744', '#00E676', '#2979FF', '#FFD600', '#E040FB'];
      const colorIndex = obstacle.id % giftColors.length;
      return { 
        color: giftColors[colorIndex], 
        geometry: [0.5, 0.5, 0.5] as [number, number, number],
        renderType: 'gift' as const
      };
    }
    
    // Normal trash items
    switch (obstacle.trashType) {
      case 'plastic':
        return { color: '#F8E71C', geometry: [0.3, 0.8, 0.3] as [number, number, number], renderType: 'normal' as const };
      case 'glass':
        return { color: '#4CAF50', geometry: [0.25, 0.9, 0.25] as [number, number, number], renderType: 'normal' as const };
      case 'organic':
        return { color: '#8D6E63', geometry: [0.4, 0.2, 0.6] as [number, number, number], renderType: 'normal' as const };
      case 'paper':
        return { color: '#2196F3', geometry: [0.5, 0.1, 0.7] as [number, number, number], renderType: 'normal' as const };
      default:
        return { color: '#666666', geometry: [0.4, 0.4, 0.4] as [number, number, number], renderType: 'normal' as const };
    }
  }, [obstacle.trashType, obstacle.id, theme.trashStyle]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        obstacle.position.x,
        obstacle.position.y,
        obstacle.position.z
      );
    }
  });

  if (renderType === 'pumpkin') {
    return (
      <group position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
        <mesh castShadow ref={meshRef}>
          <sphereGeometry args={[geometry[0], 8, 6]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0, geometry[1] * 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 6]} />
          <meshLambertMaterial color="#2E7D32" />
        </mesh>
      </group>
    );
  }

  if (renderType === 'gift') {
    return (
      <group position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
        <mesh castShadow ref={meshRef}>
          <boxGeometry args={geometry} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0, geometry[1] * 0.51, 0]} castShadow>
          <boxGeometry args={[geometry[0] * 1.1, 0.08, geometry[2] * 0.2]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
        <mesh position={[0, geometry[1] * 0.51, 0]} castShadow>
          <boxGeometry args={[geometry[0] * 0.2, 0.08, geometry[2] * 1.1]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </group>
    );
  }

  return (
    <mesh 
      ref={meshRef} 
      position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
      castShadow
    >
      <boxGeometry args={geometry} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}
