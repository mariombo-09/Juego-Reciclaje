import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { Mesh, BoxGeometry, MeshLambertMaterial } from "three";
import * as THREE from "three";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";
import { usePlayerSkins } from "../lib/stores/usePlayerSkins";

enum Controls {
  left = 'left',
  right = 'right',
  jump = 'jump',
  restart = 'restart'
}

export default function Player() {
  const meshRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const runningAnimationRef = useRef({ time: 0 });
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  const { 
    playerPosition, 
    isJumping, 
    setPlayerLane, 
    jump, 
    gameState,
    playerLane,
    currentTutorialStep,
    nextTutorialStep,
    runningSpeed
  } = useRecyclingGame();
  
  // Get current skin colors
  const { getCurrentSkin } = usePlayerSkins();
  const currentSkin = getCurrentSkin();

  // Handle keyboard input
  useEffect(() => {
    const unsubscribeLeft = subscribeKeys(
      (state) => state.right,
      (pressed) => {
        if (pressed && (gameState === 'playing' || gameState === 'tutorial')) {
          console.log("Left key pressed, current lane:", playerLane);
          setPlayerLane(Math.max(0, playerLane - 1));
          
          // Tutorial progression
          if (gameState === 'tutorial' && currentTutorialStep?.targetAction === 'move-left') {
            setTimeout(() => nextTutorialStep(), 1000);
          }
        }
      }
    );

    const unsubscribeRight = subscribeKeys(
      (state) => state.left,
      (pressed) => {
        if (pressed && (gameState === 'playing' || gameState === 'tutorial')) {
          console.log("Right key pressed, current lane:", playerLane);
          setPlayerLane(Math.min(3, playerLane + 1));
          
          // Tutorial progression
          if (gameState === 'tutorial' && currentTutorialStep?.targetAction === 'move-right') {
            setTimeout(() => nextTutorialStep(), 1000);
          }
        }
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (pressed) => {
        if (pressed && (gameState === 'playing' || gameState === 'tutorial') && !isJumping) {
          // Check if player is near containers before allowing jump
          const CONTAINER_INTERVAL = 40;
          const JUMP_ALLOWED_DISTANCE = 8; // Allow jumping when 8 units away from containers
          
          // Find the next container station ahead
          const nextContainerZ = Math.ceil(playerPosition.z / CONTAINER_INTERVAL) * CONTAINER_INTERVAL;
          const distanceToContainer = nextContainerZ - playerPosition.z;
          
          // Only allow jump if near containers
          if (distanceToContainer <= JUMP_ALLOWED_DISTANCE && distanceToContainer > 0) {
            console.log("Jump key pressed - near containers");
            jump();
            
            // Tutorial progression
            if (gameState === 'tutorial' && currentTutorialStep?.targetAction === 'jump') {
              setTimeout(() => nextTutorialStep(), 800);
            }
          } else {
            console.log("Jump not allowed - not near containers");
          }
        }
      }
    );

    return () => {
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeJump();
    };
  }, [subscribeKeys, setPlayerLane, jump, gameState, isJumping, playerLane]);

  // Update player position and running animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update position from game store
      meshRef.current.position.x = playerPosition.x;
      meshRef.current.position.y = playerPosition.y;
      meshRef.current.position.z = playerPosition.z;
      
      // Running animation when playing
      if ((gameState === 'playing' || gameState === 'tutorial') && !isJumping) {
        const animSpeed = runningSpeed * 1.5; // Animation speed based on running speed
        runningAnimationRef.current.time += delta * animSpeed;
        
        // Leg movement animation (running cycle)
        const legSwing = Math.sin(runningAnimationRef.current.time) * 0.3;
        const armSwing = Math.sin(runningAnimationRef.current.time + Math.PI) * 0.2;
        
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = legSwing;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -legSwing;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = armSwing;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -armSwing;
        }
        
        // Slight head bobbing
        const headBob = Math.sin(runningAnimationRef.current.time * 2) * 0.02;
        meshRef.current.position.y += headBob;
      }
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.5, 0]} castShadow>
      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshLambertMaterial color={currentSkin.colors.head} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshLambertMaterial color={currentSkin.colors.body} />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.3, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
        <meshLambertMaterial color={currentSkin.colors.arms} />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.3, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
        <meshLambertMaterial color={currentSkin.colors.arms} />
      </mesh>
      
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.12, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshLambertMaterial color={currentSkin.colors.legs} />
      </mesh>
      
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.12, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshLambertMaterial color={currentSkin.colors.legs} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshLambertMaterial color={currentSkin.colors.eyes} />
      </mesh>
      
      <mesh position={[0.08, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshLambertMaterial color={currentSkin.colors.eyes} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshLambertMaterial color={currentSkin.colors.hair} />
      </mesh>
      
      {/* Hat (only for special skins) */}
      {currentSkin.hasHat && (
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          <meshLambertMaterial color={currentSkin.hatColor || '#000000'} />
        </mesh>
      )}
      
      {currentSkin.hasHat && (
        <mesh position={[0, 1.15, 0.05]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshLambertMaterial color={currentSkin.hatColor || '#000000'} />
        </mesh>
      )}
    </group>
  );
}
