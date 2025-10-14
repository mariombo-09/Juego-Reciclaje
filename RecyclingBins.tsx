import { useMemo } from "react";
import * as THREE from "three";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import { TrashType } from "../types/game";

// Container spawn interval (distance in units)
const CONTAINER_SPAWN_INTERVAL = 40; // Every 40 units

// Container configurations for each type
const CONTAINER_CONFIGS = {
  glass: { 
    color: '#2E7D32', // Dark green 
    metalColor: '#666666',
    labelColor: '#FFFFFF',
    type: 'glass',
    lane: 0
  },
  organic: { 
    color: '#5D4037', // Dark brown
    metalColor: '#666666', 
    labelColor: '#FFFFFF',
    type: 'organic',
    lane: 1
  },
  paper: { 
    color: '#1976D2', // Dark blue
    metalColor: '#666666',
    labelColor: '#FFFFFF', 
    type: 'paper',
    lane: 2
  },
  plastic: { 
    color: '#FFD700', // Yellow
    metalColor: '#666666',
    labelColor: '#000000',
    type: 'plastic',
    lane: 3
  }
};

const LANE_POSITIONS = [-3, -1, 1, 3]; // x positions for 4 lanes

interface RealisticContainerProps {
  config: typeof CONTAINER_CONFIGS[keyof typeof CONTAINER_CONFIGS];
  position: { x: number; y: number; z: number };
}

function RealisticContainer({ config, position }: RealisticContainerProps) {
  const { color, metalColor, labelColor } = config;
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Main container body - large industrial size */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 2.5, 16]} />
        <meshLambertMaterial 
          color={color}
        />
      </mesh>
      
      {/* Container lid with handles */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.15, 16]} />
        <meshLambertMaterial 
          color={new THREE.Color(color).multiplyScalar(0.9)}
        />
      </mesh>
      
      {/* Lid handle */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <torusGeometry args={[0.15, 0.05, 8, 16]} />
        <meshLambertMaterial color={metalColor} />
      </mesh>
      
      {/* Side handles (left and right) */}
      {[-1, 1].map((side, idx) => (
        <group key={`handle-${idx}`} position={[side * 1.1, 0.3, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.12, 0.04, 6, 12]} />
            <meshLambertMaterial color={metalColor} />
          </mesh>
        </group>
      ))}
      
      {/* Wheels at the base */}
      {[-0.8, 0.8].map((wheelX, idx) => (
        <group key={`wheel-${idx}`} position={[wheelX, -1.2, 0.9]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
            <meshLambertMaterial color="#1A1A1A" />
          </mesh>
          {/* Wheel rim */}
          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 6, 12]} />
            <meshLambertMaterial color={metalColor} />
          </mesh>
        </group>
      ))}
      
      {/* Large recycling symbol on front */}
      <mesh position={[0, 0.2, 1.31]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 3]} />
        <meshLambertMaterial color={labelColor} />
      </mesh>
      
      {/* Recycling arrows (simplified) */}
      <mesh position={[0, 0.2, 1.35]} castShadow>
        <torusGeometry args={[0.25, 0.04, 6, 12]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Type label plate */}
      <mesh position={[0, -0.3, 1.32]} castShadow>
        <boxGeometry args={[0.8, 0.25, 0.05]} />
        <meshLambertMaterial color={labelColor} />
      </mesh>
      
      {/* Label background for contrast */}
      <mesh position={[0, -0.3, 1.34]} castShadow>
        <boxGeometry args={[0.75, 0.2, 0.02]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Metal reinforcement bands */}
      {[-0.7, 0, 0.7].map((bandY, idx) => (
        <mesh key={`band-${idx}`} position={[0, bandY, 0]} castShadow>
          <torusGeometry args={[1.32, 0.03, 6, 16]} />
          <meshLambertMaterial color={metalColor} />
        </mesh>
      ))}
      
      {/* Drainage holes at bottom */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const angle = (idx / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.9;
        const z = Math.sin(angle) * 0.9;
        return (
          <mesh key={`drain-${idx}`} position={[x, -1.15, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshLambertMaterial color="#000000" />
          </mesh>
        );
      })}
      
      {/* Professional warning labels */}
      <mesh position={[0.8, 0.8, 1.0]} castShadow rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      
      {/* Hinges on lid */}
      {[-0.6, 0.6].map((hingeX, idx) => (
        <mesh key={`hinge-${idx}`} position={[hingeX, 1.25, 1.1]} castShadow>
          <boxGeometry args={[0.1, 0.15, 0.08]} />
          <meshLambertMaterial color={metalColor} />
        </mesh>
      ))}
      
      {/* Base reinforcement ring */}
      <mesh position={[0, -1.25, 0]} castShadow>
        <torusGeometry args={[1.35, 0.05, 6, 16]} />
        <meshLambertMaterial color={metalColor} />
      </mesh>
    </group>
  );
}

export default function RecyclingBins() {
  const { playerPosition, distanceTraveled } = useRecyclingGame();
  
  // Generate container positions based on distance traveled
  const containerPositions = useMemo(() => {
    const containers: Array<{
      id: string;
      config: typeof CONTAINER_CONFIGS[keyof typeof CONTAINER_CONFIGS];
      position: { x: number; y: number; z: number };
      distance: number;
    }> = [];
    
    // Calculate which container stations should be visible
    const playerZ = playerPosition.z;
    // Fix: Ensure containers always spawn ahead, never at z=0
    // Find the next container station ahead of player (minimum z=40)
    const baseDistance = Math.max(CONTAINER_SPAWN_INTERVAL, Math.ceil(distanceTraveled / CONTAINER_SPAWN_INTERVAL) * CONTAINER_SPAWN_INTERVAL);
    const startDistance = baseDistance;
    
    // Show containers from current station and next 2 stations ahead
    for (let i = 0; i <= 2; i++) {
      const stationDistance = startDistance + (i * CONTAINER_SPAWN_INTERVAL);
      const stationZ = stationDistance;
      
      // Only show if within reasonable render distance
      if (Math.abs(stationZ - playerZ) <= 80) {
        // Create container set for this station
        const containerTypes: (keyof typeof CONTAINER_CONFIGS)[] = ['glass', 'organic', 'paper', 'plastic'];
        
        containerTypes.forEach((type) => {
          const config = CONTAINER_CONFIGS[type];
          containers.push({
            id: `container-${type}-${stationDistance}`,
            config,
            position: {
              x: LANE_POSITIONS[config.lane],
              y: 1.25, // Raise containers above ground
              z: stationZ
            },
            distance: stationDistance
          });
        });
      }
    }
    
    return containers;
  }, [playerPosition.z, distanceTraveled]);
  
  return (
    <group>
      {containerPositions.map(({ id, config, position }) => (
        <RealisticContainer
          key={id}
          config={config}
          position={position}
        />
      ))}
    </group>
  );
}