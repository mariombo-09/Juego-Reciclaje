export type GameState = 'menu' | 'tutorial' | 'playing' | 'gameOver' | 'paused';

export type TrashType = 'plastic' | 'glass' | 'organic' | 'paper';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface TrashObstacle {
  id: number;
  trashType: TrashType;
  position: Vector3;
  lane: number; // 0 = left, 1 = center, 2 = right
}

export interface RecyclingBin {
  type: TrashType;
  position: Vector3;
  color: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  targetAction?: 'move-left' | 'move-right' | 'jump' | 'classify-correct' | 'avoid-obstacle';
  completionMessage?: string;
  highlightElement?: string;
}
