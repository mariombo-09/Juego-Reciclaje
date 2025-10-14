import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function Environment() {
  const asphaltTexture = useTexture("/textures/asphalt.png");
  
  // Pre-calculate truck positions
  const truckPositions = useMemo(() => [
    { x: -8, z: -10, color: '#FF6B6B' },
    { x: 8, z: -15, color: '#4ECDC4' },
    { x: -6, z: -25, color: '#95E1D3' },
    { x: 10, z: -20, color: '#F8E71C' }
  ], []);

  // Pre-calculate building positions
  const buildingPositions = useMemo(() => [
    { x: -12, z: -5, height: 3, color: '#8B7355' },
    { x: -14, z: -12, height: 4, color: '#A0522D' },
    { x: 12, z: -8, height: 2.5, color: '#696969' },
    { x: 15, z: -18, height: 3.5, color: '#778899' }
  ], []);

  return (
    <group>
      {/* Street/Road */}
      <mesh position={[0, -0.5, -15]} receiveShadow>
        <boxGeometry args={[20, 0.1, 60]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>

      {/* Sidewalks */}
      <mesh position={[-10, -0.4, -15]} receiveShadow>
        <boxGeometry args={[4, 0.1, 60]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>
      
      <mesh position={[10, -0.4, -15]} receiveShadow>
        <boxGeometry args={[4, 0.1, 60]} />
        <meshLambertMaterial color="#CCCCCC" />
      </mesh>

      {/* Lane delimiter lines for 4 lanes */}
      {[-2, 0, 2].map((x, index) => (
        <mesh key={index} position={[x, -0.35, -15]} receiveShadow>
          <boxGeometry args={[0.1, 0.05, 60]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Game frame/border */}
      {/* Top border */}
      <mesh position={[0, -0.35, 15]} receiveShadow>
        <boxGeometry args={[8, 0.05, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Bottom border */}
      <mesh position={[0, -0.35, -45]} receiveShadow>
        <boxGeometry args={[8, 0.05, 0.2]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Left border */}
      <mesh position={[-4, -0.35, -15]} receiveShadow>
        <boxGeometry args={[0.2, 0.05, 60]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Right border */}
      <mesh position={[4, -0.35, -15]} receiveShadow>
        <boxGeometry args={[0.2, 0.05, 60]} />
        <meshLambertMaterial color="#FFFFFF" />
      </mesh>

      {/* Garbage trucks as background decoration */}
      {truckPositions.map((truck, index) => (
        <group key={index} position={[truck.x, 0.5, truck.z]}>
          {/* Truck body */}
          <mesh castShadow>
            <boxGeometry args={[2, 1.5, 4]} />
            <meshLambertMaterial color={truck.color} />
          </mesh>
          
          {/* Truck cab */}
          <mesh position={[0, 0.5, 1.5]} castShadow>
            <boxGeometry args={[1.8, 1, 1]} />
            <meshLambertMaterial color={new THREE.Color(truck.color).multiplyScalar(0.8)} />
          </mesh>
          
          {/* Wheels */}
          {[-0.8, 0.8].map((wheelX, wheelIndex) => (
            <mesh key={wheelIndex} position={[wheelX, -0.6, 1]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshLambertMaterial color="#333333" />
            </mesh>
          ))}
          
          {[-0.8, 0.8].map((wheelX, wheelIndex) => (
            <mesh key={`rear-${wheelIndex}`} position={[wheelX, -0.6, -1]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshLambertMaterial color="#333333" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Buildings */}
      {buildingPositions.map((building, index) => (
        <mesh 
          key={index} 
          position={[building.x, building.height / 2, building.z]} 
          castShadow
        >
          <boxGeometry args={[3, building.height, 4]} />
          <meshLambertMaterial color={building.color} />
        </mesh>
      ))}

      {/* Scattered trash on the ground for atmosphere */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (Math.random() - 0.5) * 18;
        const z = -Math.random() * 40 - 5;
        const trashColors = ['#F8E71C', '#4CAF50', '#8D6E63', '#2196F3']; // Yellow, Green, Brown, Blue
        const color = trashColors[Math.floor(Math.random() * trashColors.length)];
        
        return (
          <mesh key={i} position={[x, -0.3, z]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.2]} />
            <meshLambertMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
