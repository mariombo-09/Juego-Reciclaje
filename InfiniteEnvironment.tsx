import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import { useGameThemes } from "../lib/stores/useGameThemes";
import * as THREE from "three";

// Chunk system constants
const CHUNK_SIZE = 30; // Length of each chunk in units
const RENDER_DISTANCE = 120; // Distance ahead/behind player to render chunks
const CHUNKS_AHEAD = Math.ceil(RENDER_DISTANCE / CHUNK_SIZE);
const CHUNKS_BEHIND = 2; // Keep fewer chunks behind for performance

// Environment object types
interface EnvironmentObject {
  id: string;
  type: 'building' | 'tree' | 'streetlight' | 'sign' | 'truck' | 'debris' | 'web' | 'snowflake';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  color?: string;
  variant?: number;
}

interface TerrainChunk {
  id: number;
  startZ: number;
  endZ: number;
  objects: EnvironmentObject[];
  generated: boolean;
}

// Seeded random number generator for consistent generation
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

function generateChunkObjects(chunkId: number, startZ: number, endZ: number, decorations: 'none' | 'webs' | 'snow'): EnvironmentObject[] {
  const objects: EnvironmentObject[] = [];
  const rng = new SeededRandom(chunkId * 12345); // Consistent seed per chunk
  
  // Building colors for variety
  const buildingColors = ['#8B7355', '#A0522D', '#696969', '#778899', '#CD853F', '#A0522D'];
  const truckColors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F8E71C', '#4CAF50', '#2196F3'];
  
  // Generate buildings (more varied and professional)
  const buildingCount = Math.floor(rng.range(2, 5));
  for (let i = 0; i < buildingCount; i++) {
    const side = rng.next() > 0.5 ? 1 : -1; // Left or right side of road
    const xPos = side * rng.range(12, 20); // Distance from road center
    const zPos = rng.range(startZ + 2, endZ - 2);
    const height = rng.range(2, 6);
    const width = rng.range(2.5, 4);
    const depth = rng.range(3, 5);
    
    objects.push({
      id: `building-${chunkId}-${i}`,
      type: 'building',
      position: { x: xPos, y: height / 2, z: zPos },
      scale: { x: width, y: height, z: depth },
      color: rng.choice(buildingColors),
      variant: Math.floor(rng.range(0, 3))
    });
  }
  
  // Generate trees (using green boxes for now)
  const treeCount = Math.floor(rng.range(3, 8));
  for (let i = 0; i < treeCount; i++) {
    const side = rng.next() > 0.5 ? 1 : -1;
    const xPos = side * rng.range(8, 15);
    const zPos = rng.range(startZ + 1, endZ - 1);
    const height = rng.range(1.5, 3);
    
    objects.push({
      id: `tree-${chunkId}-${i}`,
      type: 'tree',
      position: { x: xPos, y: height / 2, z: zPos },
      scale: { x: 0.8, y: height, z: 0.8 },
      color: '#2E7D32',
      variant: Math.floor(rng.range(0, 2))
    });
  }
  
  // Generate street lights
  const lightCount = Math.floor(rng.range(1, 3));
  for (let i = 0; i < lightCount; i++) {
    const side = rng.next() > 0.5 ? 1 : -1;
    const xPos = side * 6; // Closer to road for street lighting
    const zPos = rng.range(startZ + 5, endZ - 5);
    
    objects.push({
      id: `streetlight-${chunkId}-${i}`,
      type: 'streetlight',
      position: { x: xPos, y: 2.5, z: zPos },
      scale: { x: 0.3, y: 5, z: 0.3 },
      color: '#444444'
    });
  }
  
  // Generate parked trucks occasionally
  if (rng.next() > 0.7) {
    const side = rng.next() > 0.5 ? 1 : -1;
    const xPos = side * rng.range(8, 12);
    const zPos = rng.range(startZ + 3, endZ - 3);
    
    objects.push({
      id: `truck-${chunkId}`,
      type: 'truck',
      position: { x: xPos, y: 0.75, z: zPos },
      rotation: { x: 0, y: side > 0 ? 0 : Math.PI, z: 0 },
      scale: { x: 2, y: 1.5, z: 4 },
      color: rng.choice(truckColors)
    });
  }
  
  // Generate debris/litter scattered around
  const debrisCount = Math.floor(rng.range(5, 12));
  for (let i = 0; i < debrisCount; i++) {
    const xPos = rng.range(-18, 18);
    const zPos = rng.range(startZ, endZ);
    const debrisColors = ['#F8E71C', '#4CAF50', '#8D6E63', '#2196F3'];
    
    objects.push({
      id: `debris-${chunkId}-${i}`,
      type: 'debris',
      position: { x: xPos, y: -0.3, z: zPos },
      scale: { x: 0.15, y: 0.08, z: 0.15 },
      color: rng.choice(debrisColors)
    });
  }
  
  // Generate theme-specific decorations
  if (decorations === 'webs') {
    const webCount = Math.floor(rng.range(2, 5));
    for (let i = 0; i < webCount; i++) {
      const side = rng.next() > 0.5 ? 1 : -1;
      const xPos = side * rng.range(6, 14);
      const zPos = rng.range(startZ + 2, endZ - 2);
      const yPos = rng.range(1.5, 3.5);
      
      objects.push({
        id: `web-${chunkId}-${i}`,
        type: 'web',
        position: { x: xPos, y: yPos, z: zPos },
        scale: { x: 1, y: 1, z: 0.1 },
        color: '#CCCCCC',
        variant: Math.floor(rng.range(0, 2))
      });
    }
  } else if (decorations === 'snow') {
    const snowCount = Math.floor(rng.range(8, 15));
    for (let i = 0; i < snowCount; i++) {
      const xPos = rng.range(-15, 15);
      const yPos = rng.range(2, 6);
      const zPos = rng.range(startZ, endZ);
      
      objects.push({
        id: `snowflake-${chunkId}-${i}`,
        type: 'snowflake',
        position: { x: xPos, y: yPos, z: zPos },
        scale: { x: 0.15, y: 0.15, z: 0.15 },
        color: '#FFFFFF',
        variant: Math.floor(rng.range(0, 3))
      });
    }
  }
  
  return objects;
}

function EnvironmentObject({ object }: { object: EnvironmentObject }) {
  const woodTexture = useTexture("/textures/wood.jpg");
  const grassTexture = useTexture("/textures/grass.png");
  
  const { position, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }, color, type, variant } = object;
  
  // Different geometries and materials based on type
  const renderObject = () => {
    switch (type) {
      case 'building':
        return (
          <group>
            {/* Main building */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[scale.x, scale.y, scale.z]} />
              <meshLambertMaterial color={color} />
            </mesh>
            
            {/* Building details based on variant */}
            {variant === 1 && (
              <mesh position={[0, scale.y * 0.4, scale.z * 0.45]} castShadow>
                <boxGeometry args={[scale.x * 0.8, scale.y * 0.2, 0.1]} />
                <meshLambertMaterial color={new THREE.Color(color!).multiplyScalar(0.9)} />
              </mesh>
            )}
            
            {variant === 2 && (
              <mesh position={[0, scale.y * 0.35, 0]} castShadow>
                <boxGeometry args={[scale.x * 1.1, scale.y * 0.3, scale.z * 1.1]} />
                <meshLambertMaterial color={new THREE.Color(color!).multiplyScalar(0.7)} />
              </mesh>
            )}
          </group>
        );
        
      case 'tree':
        return (
          <group>
            {/* Tree trunk */}
            <mesh position={[0, -scale.y * 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, scale.y * 0.6, 8]} />
              <meshLambertMaterial color="#8D6E63" />
            </mesh>
            
            {/* Tree foliage */}
            <mesh position={[0, scale.y * 0.2, 0]} castShadow>
              <sphereGeometry args={[scale.y * 0.4, 8, 6]} />
              <meshLambertMaterial color={color} />
            </mesh>
          </group>
        );
        
      case 'streetlight':
        return (
          <group>
            {/* Pole */}
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.15, scale.y, 8]} />
              <meshLambertMaterial color={color} />
            </mesh>
            
            {/* Light fixture */}
            <mesh position={[0, scale.y * 0.4, 0]} castShadow>
              <sphereGeometry args={[0.3, 8, 6]} />
              <meshLambertMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={0.1} />
            </mesh>
          </group>
        );
        
      case 'truck':
        return (
          <group>
            {/* Truck body */}
            <mesh castShadow>
              <boxGeometry args={[scale.x, scale.y, scale.z]} />
              <meshLambertMaterial color={color} />
            </mesh>
            
            {/* Truck cab */}
            <mesh position={[0, scale.y * 0.3, scale.z * 0.3]} castShadow>
              <boxGeometry args={[scale.x * 0.9, scale.y * 0.7, scale.z * 0.25]} />
              <meshLambertMaterial color={new THREE.Color(color!).multiplyScalar(0.8)} />
            </mesh>
            
            {/* Wheels */}
            {[-scale.x * 0.4, scale.x * 0.4].map((wheelX, idx) => (
              <mesh key={`front-wheel-${idx}`} position={[wheelX, -scale.y * 0.4, scale.z * 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
                <meshLambertMaterial color="#333333" />
              </mesh>
            ))}
            
            {[-scale.x * 0.4, scale.x * 0.4].map((wheelX, idx) => (
              <mesh key={`rear-wheel-${idx}`} position={[wheelX, -scale.y * 0.4, -scale.z * 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
                <meshLambertMaterial color="#333333" />
              </mesh>
            ))}
          </group>
        );
        
      case 'debris':
        return (
          <mesh castShadow>
            <boxGeometry args={[scale.x, scale.y, scale.z]} />
            <meshLambertMaterial color={color} />
          </mesh>
        );
        
      case 'web':
        return (
          <group>
            <mesh>
              <planeGeometry args={[scale.x, scale.y]} />
              <meshLambertMaterial 
                color={color} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-scale.x * 0.3, scale.y * 0.2, 0]}>
              <boxGeometry args={[0.02, scale.y * 0.6, 0.02]} />
              <meshLambertMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[scale.x * 0.3, -scale.y * 0.2, 0]}>
              <boxGeometry args={[0.02, scale.y * 0.6, 0.02]} />
              <meshLambertMaterial color="#FFFFFF" />
            </mesh>
          </group>
        );
        
      case 'snowflake':
        return (
          <group>
            <mesh>
              <sphereGeometry args={[scale.x, 6, 4]} />
              <meshLambertMaterial color={color} emissive="#FFFFFF" emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
        
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[scale.x, scale.y, scale.z]} />
            <meshLambertMaterial color={color} />
          </mesh>
        );
    }
  };
  
  return (
    <group position={[position.x, position.y, position.z]} rotation={[rotation.x, rotation.y, rotation.z]}>
      {renderObject()}
    </group>
  );
}

export default function InfiniteEnvironment() {
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const grassTexture = useTexture("/textures/grass.png");
  
  const { playerPosition } = useRecyclingGame();
  const { getCurrentTheme } = useGameThemes();
  const theme = getCurrentTheme();
  const chunksRef = useRef<Map<number, TerrainChunk>>(new Map());
  const activeChunksRef = useRef<Set<number>>(new Set());
  const lastLoggedChunkRef = useRef<number | null>(null);
  
  // Function to generate chunk if it doesn't exist
  const ensureChunk = (chunkId: number) => {
    if (!chunksRef.current.has(chunkId)) {
      const startZ = chunkId * CHUNK_SIZE;
      const endZ = startZ + CHUNK_SIZE;
      
      const chunk: TerrainChunk = {
        id: chunkId,
        startZ,
        endZ,
        objects: generateChunkObjects(chunkId, startZ, endZ, theme.decorations),
        generated: true
      };
      
      chunksRef.current.set(chunkId, chunk);
    }
  };
  
  // Update active chunks based on player position
  useFrame(() => {
    if (!playerPosition) return;
    
    const playerChunkId = Math.floor(playerPosition.z / CHUNK_SIZE);
    const newActiveChunks = new Set<number>();
    
    // Generate chunks around player
    for (let i = playerChunkId - CHUNKS_BEHIND; i <= playerChunkId + CHUNKS_AHEAD; i++) {
      ensureChunk(i);
      newActiveChunks.add(i);
    }
    
    // Clean up distant chunks for performance
    const chunksToRemove: number[] = [];
    chunksRef.current.forEach((chunk, chunkId) => {
      if (!newActiveChunks.has(chunkId)) {
        chunksToRemove.push(chunkId);
      }
    });
    
    // Remove old chunks and log for debugging
    chunksToRemove.forEach(chunkId => {
      chunksRef.current.delete(chunkId);
    });
    
    // Debug logging only when entering a new chunk (prevent spam)
    if (playerChunkId !== lastLoggedChunkRef.current) {
      console.log(`Infinite Environment: Player entered chunk ${playerChunkId}, active chunks: ${Array.from(newActiveChunks).join(', ')}, total chunks: ${chunksRef.current.size}`);
      lastLoggedChunkRef.current = playerChunkId;
    }
    
    activeChunksRef.current = newActiveChunks;
  });
  
  // Get visible chunks for rendering
  const visibleChunks = useMemo(() => {
    const chunks = Array.from(activeChunksRef.current)
      .map(chunkId => chunksRef.current.get(chunkId))
      .filter(chunk => chunk !== undefined) as TerrainChunk[];
    
    // Sort chunks by distance for better rendering order
    return chunks.sort((a, b) => Math.abs(a.startZ - (playerPosition?.z || 0)) - Math.abs(b.startZ - (playerPosition?.z || 0)));
  }, [activeChunksRef.current, playerPosition]);
  
  return (
    <group>
      {/* Infinite terrain generation */}
      {visibleChunks.map(chunk => (
        <group key={chunk.id}>
          {/* Road section */}
          <mesh position={[0, -0.5, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
            <boxGeometry args={[20, 0.1, CHUNK_SIZE]} />
            <meshLambertMaterial map={asphaltTexture} />
          </mesh>
          
          {/* Left sidewalk */}
          <mesh position={[-10, -0.4, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
            <boxGeometry args={[4, 0.1, CHUNK_SIZE]} />
            <meshLambertMaterial color="#CCCCCC" />
          </mesh>
          
          {/* Right sidewalk */}
          <mesh position={[10, -0.4, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
            <boxGeometry args={[4, 0.1, CHUNK_SIZE]} />
            <meshLambertMaterial color="#CCCCCC" />
          </mesh>
          
          {/* Lane delimiter lines */}
          {[-2, 0, 2].map((x, index) => (
            <mesh key={`lane-${chunk.id}-${index}`} position={[x, -0.35, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
              <boxGeometry args={[0.1, 0.05, CHUNK_SIZE]} />
              <meshLambertMaterial color="#FFFFFF" />
            </mesh>
          ))}
          
          {/* Grass areas beyond sidewalks */}
          <mesh position={[-16, -0.45, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
            <boxGeometry args={[8, 0.05, CHUNK_SIZE]} />
            <meshLambertMaterial map={grassTexture} />
          </mesh>
          
          <mesh position={[16, -0.45, chunk.startZ + CHUNK_SIZE / 2]} receiveShadow>
            <boxGeometry args={[8, 0.05, CHUNK_SIZE]} />
            <meshLambertMaterial map={grassTexture} />
          </mesh>
          
          {/* Environment objects for this chunk */}
          {chunk.objects.map(object => (
            <EnvironmentObject key={object.id} object={object} />
          ))}
        </group>
      ))}
      
      {/* Game boundaries (invisible walls to keep player in play area) */}
      {playerPosition && (
        <>
          <mesh position={[-4, -0.35, playerPosition.z]} receiveShadow>
            <boxGeometry args={[0.2, 0.05, 1]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
          
          <mesh position={[4, -0.35, playerPosition.z]} receiveShadow>
            <boxGeometry args={[0.2, 0.05, 1]} />
            <meshLambertMaterial color="#FFFFFF" />
          </mesh>
        </>
      )}
    </group>
  );
}