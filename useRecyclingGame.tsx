import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TrashObstacle, GameState, TrashType, Vector3, TutorialStep } from "../../types/game";
import { WasteItem, getRandomWasteItem } from "../../data/wasteItems";
import { usePowerUps } from "./usePowerUps";

// localStorage functions for coin persistence
const COINS_STORAGE_KEY = 'ecorunner_coins';
const HIGH_SCORE_STORAGE_KEY = 'ecorunner_highscore';

function saveCoinsToStorage(coins: number) {
  try {
    localStorage.setItem(COINS_STORAGE_KEY, coins.toString());
  } catch (error) {
    console.warn('Failed to save coins to localStorage:', error);
  }
}

function loadCoinsFromStorage(): number {
  try {
    const saved = localStorage.getItem(COINS_STORAGE_KEY);
    return saved ? parseInt(saved, 10) || 10 : 10; // Default to 10 coins
  } catch (error) {
    console.warn('Failed to load coins from localStorage:', error);
    return 10;
  }
}

function saveHighScoreToStorage(highScore: number) {
  try {
    localStorage.setItem(HIGH_SCORE_STORAGE_KEY, highScore.toString());
  } catch (error) {
    console.warn('Failed to save high score to localStorage:', error);
  }
}

function loadHighScoreFromStorage(): number {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0; // Default to 0 high score
  } catch (error) {
    console.warn('Failed to load high score from localStorage:', error);
    return 0;
  }
}

interface RecyclingGameState {
  // Game state
  gameState: GameState;
  score: number;
  lives: number;
  coins: number;
  highScore: number;
  gameSpeed: number;
  combo: number;
  
  // Tutorial state
  tutorialStep: number;
  currentTutorialStep: TutorialStep | null;
  tutorialCompleted: boolean;
  
  // Player state
  playerPosition: Vector3;
  playerLane: number; // 0 = glass (left), 1 = organic, 2 = paper, 3 = plastic (right)
  isJumping: boolean;
  jumpStartTime: number;
  runningSpeed: number;
  distanceTraveled: number;
  lastSpawnDistance: number;
  
  // Game objects
  obstacles: TrashObstacle[];
  nextObstacleId: number;
  currentWasteItem: WasteItem | null;
  
  // UI feedback
  classificationMessage: string | null;
  messageTimeout: NodeJS.Timeout | null;
  
  // Actions
  startGame: () => void;
  startTutorial: () => void;
  restartGame: () => void;
  endGame: () => void;
  setPlayerLane: (lane: number) => void;
  jump: () => void;
  spawnObstacle: () => void;
  shouldSpawnObstacle: () => boolean;
  removeObstacle: (id: number) => void;
  updateGame: (delta: number) => void;
  classifyTrash: (obstacle: TrashObstacle) => void;
  nextTutorialStep: () => void;
  completeTutorial: () => void;
  generateNewWasteItem: () => void;
  classifyCurrentWaste: () => void;
  revivePlayer: () => void;
  canRevive: () => boolean;
  setCoins: (coins: number) => void;
  togglePause: () => void;
}

const LANE_POSITIONS = [-3, -1, 1, 3]; // x positions for 4 lanes: glass, organic, paper, plastic
const JUMP_DURATION = 0.8; // seconds
const JUMP_HEIGHT = 2;

// Distance-based spawning constants
const SPAWN_DISTANCE_PLAYING = 8; // Spawn obstacle every 8 units in playing mode
const SPAWN_DISTANCE_TUTORIAL = 12; // Spawn obstacle every 12 units in tutorial mode
const MAX_OBSTACLES_PLAYING = 15; // Maximum obstacles in playing mode
const MAX_OBSTACLES_TUTORIAL = 8; // Maximum obstacles in tutorial mode

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a EcoRunner!',
    description: 'Aprenderás a clasificar basura para ayudar al medio ambiente.',
    instruction: 'Lee la información y haz clic en "Continuar"',
  },
  {
    id: 'movement',
    title: 'Movimiento por Carriles',
    description: 'Usa las teclas de flecha o A/D para moverte entre carriles.',
    instruction: 'Prueba mover tu personaje a la izquierda',
    targetAction: 'move-left',
    completionMessage: '¡Bien! Ahora prueba mover a la derecha',
  },
  {
    id: 'jumping',
    title: 'Saltar y Clasificar',
    description: 'Presiona ESPACIO para saltar sobre obstáculos y clasificar basura.',
    instruction: 'Presiona ESPACIO para saltar',
    targetAction: 'jump',
    completionMessage: '¡Excelente! El salto también sirve para clasificar basura.',
  },
  {
    id: 'trash-types',
    title: 'Tipos de Basura y Colores',
    description: 'Hay 4 tipos de basura: Plástico (amarillo), Vidrio (verde), Orgánico (marrón), y Papel (azul).',
    instruction: 'Memoriza los colores correctos para cada tipo de basura',
  },
  {
    id: 'classification',
    title: 'Clasificación Correcta',
    description: 'Muévete al carril del cubo correcto y salta para clasificar. De izquierda a derecha: Vidrio=verde, Orgánico=marrón, Papel=azul, Plástico=amarillo.',
    instruction: 'Clasifica correctamente la basura que aparece',
    targetAction: 'classify-correct',
    completionMessage: '¡Perfecto! Has aprendido a reciclar correctamente.',
  }
];

export const useRecyclingGame = create<RecyclingGameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gameState: 'menu',
    score: 0,
    lives: 3,
    coins: loadCoinsFromStorage(),
    highScore: loadHighScoreFromStorage(),
    gameSpeed: 8,
    combo: 1,
    
    // Tutorial state
    tutorialStep: 0,
    currentTutorialStep: null,
    tutorialCompleted: false,
    
    playerPosition: { x: 0, y: 0.5, z: 0 },
    playerLane: 1, // Start in second lane (organic)
    isJumping: false,
    jumpStartTime: 0,
    runningSpeed: 5,
    distanceTraveled: 0,
    lastSpawnDistance: 0,
    
    obstacles: [],
    nextObstacleId: 1,
    currentWasteItem: null,
    
    classificationMessage: null,
    messageTimeout: null,
    
    startGame: () => {
      const savedCoins = loadCoinsFromStorage();
      set({
        gameState: 'playing',
        score: 0,
        lives: 3,
        coins: savedCoins,
        obstacles: [],
        playerLane: 1,
        playerPosition: { x: 0, y: 0.5, z: 0 },
        isJumping: false,
        combo: 1,
        distanceTraveled: 0,
        lastSpawnDistance: 0,
        currentWasteItem: getRandomWasteItem()
      });
    },
    
    startTutorial: () => {
      const savedCoins = loadCoinsFromStorage();
      set({
        gameState: 'tutorial',
        score: 0,
        lives: 3,
        coins: savedCoins,
        obstacles: [],
        playerLane: 1,
        playerPosition: { x: 0, y: 0.5, z: 0 },
        isJumping: false,
        combo: 1,
        distanceTraveled: 0,
        lastSpawnDistance: 0,
        tutorialStep: 0,
        currentTutorialStep: TUTORIAL_STEPS[0],
        currentWasteItem: getRandomWasteItem()
      });
    },
    
    restartGame: () => {
      const { messageTimeout } = get();
      if (messageTimeout) clearTimeout(messageTimeout);
      const savedCoins = loadCoinsFromStorage();
      
      set({
        gameState: 'menu',
        score: 0,
        lives: 3,
        coins: savedCoins,
        obstacles: [],
        playerLane: 1,
        playerPosition: { x: 0, y: 0.5, z: 0 },
        isJumping: false,
        classificationMessage: null,
        messageTimeout: null,
        combo: 1,
        distanceTraveled: 0,
        lastSpawnDistance: 0,
        currentWasteItem: null
      });
    },
    
    endGame: () => {
      const { score, highScore } = get();
      let newHighScore = highScore;
      
      // Update high score if current score is higher
      if (score > highScore) {
        newHighScore = score;
        saveHighScoreToStorage(newHighScore);
      }
      
      set({ 
        gameState: 'gameOver',
        highScore: newHighScore
      });
    },
    
    setPlayerLane: (lane: number) => {
      const clampedLane = Math.max(0, Math.min(3, lane));
      
      set((state) => ({
        playerLane: clampedLane,
        playerPosition: {
          ...state.playerPosition,
          x: LANE_POSITIONS[clampedLane]
        }
      }));
    },
    
    jump: () => {
      const currentTime = Date.now() / 1000;
      
      set({
        isJumping: true,
        jumpStartTime: currentTime
      });
      
      // Classify current waste item when jumping
      get().classifyCurrentWaste();
    },
    
    spawnObstacle: () => {
      const { nextObstacleId, playerPosition } = get();
      const trashTypes: TrashType[] = ['plastic', 'glass', 'organic', 'paper'];
      const randomType = trashTypes[Math.floor(Math.random() * trashTypes.length)];
      const randomLane = Math.floor(Math.random() * 4); // Now using 4 lanes
      
      // Spawn obstacles ahead of the running player (10-20 units ahead)
      let spawnDistance = 10 + Math.random() * 10; // Between 10 and 20 units ahead
      let obstacleZ = playerPosition.z + spawnDistance;
      
      // Prevent spawning too close to container positions (every 40 units)
      const CONTAINER_INTERVAL = 40;
      const CONTAINER_BUFFER = 5; // Don't spawn within 5 units of containers
      
      // Find if obstacleZ is too close to any container position
      const nearestContainerStation = Math.round(obstacleZ / CONTAINER_INTERVAL) * CONTAINER_INTERVAL;
      const distanceToNearestContainer = Math.abs(obstacleZ - nearestContainerStation);
      
      // If too close to a container, adjust the position
      if (distanceToNearestContainer < CONTAINER_BUFFER) {
        // Move obstacle to midpoint between container stations
        const midpoint = nearestContainerStation + (CONTAINER_INTERVAL / 2);
        obstacleZ = midpoint;
      }
      
      const obstacle: TrashObstacle = {
        id: nextObstacleId,
        trashType: randomType,
        position: {
          x: LANE_POSITIONS[randomLane],
          y: 0.3,
          z: obstacleZ
        },
        lane: randomLane
      };
      
      set((state) => ({
        obstacles: [...state.obstacles, obstacle],
        nextObstacleId: nextObstacleId + 1
      }));
    },
    
    shouldSpawnObstacle: () => {
      const { gameState, obstacles, distanceTraveled, lastSpawnDistance } = get();
      
      const maxObstacles = gameState === 'tutorial' ? MAX_OBSTACLES_TUTORIAL : MAX_OBSTACLES_PLAYING;
      const spawnDistance = gameState === 'tutorial' ? SPAWN_DISTANCE_TUTORIAL : SPAWN_DISTANCE_PLAYING;
      
      // Check if we've reached max obstacles
      if (obstacles.length >= maxObstacles) {
        return false;
      }
      
      // Check if enough distance has passed since last spawn
      const distanceSinceLastSpawn = distanceTraveled - lastSpawnDistance;
      
      if (distanceSinceLastSpawn >= spawnDistance) {
        // Update last spawn distance and spawn obstacle
        set({ lastSpawnDistance: distanceTraveled });
        return true;
      }
      
      return false;
    },
    
    removeObstacle: (id: number) => {
      set((state) => ({
        obstacles: state.obstacles.filter(obs => obs.id !== id)
      }));
    },
    
    updateGame: (delta: number) => {
      const state = get();
      
      // Move player forward continuously
      const forwardMovement = state.runningSpeed * delta;
      const newDistanceTraveled = state.distanceTraveled + forwardMovement;
      const newPlayerZ = state.playerPosition.z + forwardMovement;
      
      // Update jump animation
      let newPlayerY = state.playerPosition.y;
      let newIsJumping = state.isJumping;
      
      if (state.isJumping) {
        const currentTime = Date.now() / 1000;
        const jumpProgress = (currentTime - state.jumpStartTime) / JUMP_DURATION;
        
        if (jumpProgress >= 1) {
          // Landing
          newPlayerY = 0.5;
          newIsJumping = false;
        } else {
          // Jump arc (parabolic)
          newPlayerY = 0.5 + JUMP_HEIGHT * Math.sin(jumpProgress * Math.PI);
        }
      }
      
      // Prepare state updates to batch
      let newLives = state.lives;
      let newCombo = state.combo;
      let newObstacles = state.obstacles;
      const newRunningSpeed = Math.min(state.runningSpeed + (delta * 0.2), 12);
      
      // Auto-jump functionality: Check if player is approaching containers and should auto-jump
      if (!newIsJumping) {
        // Container spawn interval is 40 units
        const CONTAINER_INTERVAL = 40;
        const AUTO_JUMP_DISTANCE = 3; // Auto-jump when 3 units away from containers
        
        // Find the next container station ahead
        const nextContainerZ = Math.ceil(newPlayerZ / CONTAINER_INTERVAL) * CONTAINER_INTERVAL;
        const distanceToContainer = nextContainerZ - newPlayerZ;
        
        // If player is close to containers and hasn't jumped, auto-jump
        if (distanceToContainer <= AUTO_JUMP_DISTANCE && distanceToContainer > 0) {
          // Trigger auto-jump
          const currentTime = Date.now() / 1000;
          newIsJumping = true;
          
          set({
            isJumping: true,
            jumpStartTime: currentTime
          });
          
          // Classify current waste item during auto-jump - this will handle lives separately
          setTimeout(() => get().classifyCurrentWaste(), 10);
        }
      }
      
      // Check for collisions with obstacles
      if (!newIsJumping) {
        for (const obstacle of newObstacles) {
          // Check if player is close enough to the obstacle for collision
          const horizontalDistance = Math.abs(obstacle.position.x - LANE_POSITIONS[state.playerLane]);
          const verticalDistance = Math.abs(obstacle.position.z - newPlayerZ);
          
          // Collision detected: same lane and close in distance
          if (horizontalDistance < 0.5 && verticalDistance < 1.0) {
            // Player collided with obstacle without jumping/classifying - lose a life
            newLives = Math.max(0, newLives - 1);
            newCombo = 1; // Reset combo
            
            // Remove the obstacle
            newObstacles = newObstacles.filter(obs => obs.id !== obstacle.id);
            
            // Show collision message
            const { messageTimeout } = get();
            if (messageTimeout) clearTimeout(messageTimeout);
            
            const timeout = setTimeout(() => {
              set({ classificationMessage: null, messageTimeout: null });
            }, 2000);
            
            set({
              classificationMessage: '¡Chocaste con la basura! -1 vida',
              messageTimeout: timeout
            });
            
            // Check if game over
            if (newLives <= 0) {
              setTimeout(() => get().endGame(), 100); // Small delay to show message
            }
            
            break; // Only handle one collision per frame
          }
        }
      }
      
      // Clean up obstacles that are behind the player
      newObstacles = newObstacles.filter(obs => obs.position.z > newPlayerZ - 5);
      
      // Batch all state updates into single set() call
      // Note: lives are updated separately by classifyCurrentWaste, so we only update if there was a collision
      const updateObject: any = {
        distanceTraveled: newDistanceTraveled,
        playerPosition: {
          x: LANE_POSITIONS[state.playerLane],
          y: newPlayerY,
          z: newPlayerZ
        },
        isJumping: newIsJumping,
        combo: newCombo,
        obstacles: newObstacles,
        runningSpeed: newRunningSpeed
      };
      
      // Only update lives if they changed due to collision (not classification)
      if (newLives !== state.lives) {
        updateObject.lives = newLives;
      }
      
      set(updateObject);
    },
    
    classifyTrash: (obstacle: TrashObstacle) => {
      const { playerLane, combo } = get();
      let isCorrect = false;
      let message = "";
      
      // Determine correct classification based on player lane and trash type
      switch (playerLane) {
        case 0: // Lane 0 - Glass (green)
          isCorrect = obstacle.trashType === 'glass';
          break;
        case 1: // Lane 1 - Organic (brown)
          isCorrect = obstacle.trashType === 'organic';
          break;
        case 2: // Lane 2 - Paper (blue)
          isCorrect = obstacle.trashType === 'paper';
          break;
        case 3: // Lane 3 - Plastic (yellow)
          isCorrect = obstacle.trashType === 'plastic';
          break;
      }
      
      if (isCorrect) {
        const points = 10 * combo;
        const multiplier = usePowerUps.getState().getCoinMultiplier();
        const coinReward = 10 * multiplier;
        message = `¡Correcto! +${points} puntos, +${coinReward} monedas${multiplier > 1 ? ` (x${multiplier})` : ''}`;
        
        set((state) => ({
          score: state.score + points,
          coins: state.coins + coinReward,
          combo: Math.min(state.combo + 1, 5) // Max combo of 5
        }));
      } else {
        const lifePenalty = 1;
        message = `¡Incorrecto! Era ${obstacle.trashType}, -${lifePenalty} vida`;
        
        let newLives = 0;
        set((state) => {
          newLives = Math.max(0, state.lives - lifePenalty);
          return {
            combo: 1, // Reset combo
            lives: newLives
          };
        });
        
        // Check if game over immediately after setting new lives
        if (newLives <= 0) {
          setTimeout(() => get().endGame(), 100);
        }
      }
      
      // Remove the obstacle
      get().removeObstacle(obstacle.id);
      
      // Show message
      const { messageTimeout } = get();
      if (messageTimeout) clearTimeout(messageTimeout);
      
      const timeout = setTimeout(() => {
        set({ classificationMessage: null, messageTimeout: null });
      }, 2000);
      
      set({
        classificationMessage: message,
        messageTimeout: timeout
      });
    },
    
    nextTutorialStep: () => {
      const { tutorialStep } = get();
      const nextStep = tutorialStep + 1;
      
      if (nextStep >= TUTORIAL_STEPS.length) {
        get().completeTutorial();
        return;
      }
      
      set({
        tutorialStep: nextStep,
        currentTutorialStep: TUTORIAL_STEPS[nextStep]
      });
    },
    
    completeTutorial: () => {
      set({
        tutorialCompleted: true,
        gameState: 'menu',
        currentTutorialStep: null
      });
      
      // Show completion message
      const timeout = setTimeout(() => {
        set({ classificationMessage: null, messageTimeout: null });
      }, 3000);
      
      set({
        classificationMessage: '¡Tutorial completado! Ahora puedes jugar el juego completo.',
        messageTimeout: timeout
      });
    },

    generateNewWasteItem: () => {
      const newWasteItem = getRandomWasteItem();
      set({ currentWasteItem: newWasteItem });
    },

    classifyCurrentWaste: () => {
      const { currentWasteItem, playerLane, combo } = get();
      
      if (!currentWasteItem) return;
      
      let isCorrect = false;
      let message = "";
      
      // Determine correct classification based on player lane and waste type
      switch (playerLane) {
        case 0: // Lane 0 - Glass (green)
          isCorrect = currentWasteItem.correctContainer === 'glass';
          break;
        case 1: // Lane 1 - Organic (brown)
          isCorrect = currentWasteItem.correctContainer === 'organic';
          break;
        case 2: // Lane 2 - Paper (blue)
          isCorrect = currentWasteItem.correctContainer === 'paper';
          break;
        case 3: // Lane 3 - Plastic (yellow)
          isCorrect = currentWasteItem.correctContainer === 'plastic';
          break;
      }
      
      if (isCorrect) {
        const points = 10 * combo;
        const multiplier = usePowerUps.getState().getCoinMultiplier();
        const coinReward = 10 * multiplier;
        message = `¡Correcto! ${currentWasteItem.name} va en ${currentWasteItem.correctContainer}. +${points} puntos, +${coinReward} monedas${multiplier > 1 ? ` (x${multiplier})` : ''}`;
        
        set((state) => {
          const newCoins = state.coins + coinReward;
          saveCoinsToStorage(newCoins);
          return {
            score: state.score + points,
            coins: newCoins,
            combo: Math.min(state.combo + 1, 5) // Max combo of 5
          };
        });
      } else {
        const lifePenalty = 1;
        message = `¡Incorrecto! ${currentWasteItem.name} va en ${currentWasteItem.correctContainer}, no aquí. -${lifePenalty} vida`;
        
        let newLives = 0;
        set((state) => {
          newLives = Math.max(0, state.lives - lifePenalty);
          return {
            combo: 1, // Reset combo
            lives: newLives
          };
        });
        
        // Check if game over immediately after setting new lives
        if (newLives <= 0) {
          setTimeout(() => get().endGame(), 100);
        }
      }
      
      // Generate new waste item for next classification
      get().generateNewWasteItem();
      
      // Show feedback message
      const timeout = setTimeout(() => {
        set({ classificationMessage: null, messageTimeout: null });
      }, 2000);
      
      set({
        classificationMessage: message,
        messageTimeout: timeout
      });
      
      // Save coins to localStorage whenever they change
      const { coins } = get();
      saveCoinsToStorage(coins);
    },

    revivePlayer: () => {
      const { coins } = get();
      const REVIVAL_COST = 150;
      
      if (coins >= REVIVAL_COST) {
        const newCoins = coins - REVIVAL_COST;
        set({
          gameState: 'playing',
          lives: 3,
          coins: newCoins,
          currentWasteItem: getRandomWasteItem()
        });
        
        // Save updated coins to localStorage
        saveCoinsToStorage(newCoins);
      }
    },

    canRevive: () => {
      const { coins } = get();
      return coins >= 150;
    },

    setCoins: (coins: number) => {
      set({ coins });
      saveCoinsToStorage(coins);
    },

    togglePause: () => {
      const { gameState } = get();
      if (gameState === 'paused') {
        set({ gameState: 'playing' });
      } else if (gameState === 'playing') {
        set({ gameState: 'paused' });
      }
    }
  }))
);
