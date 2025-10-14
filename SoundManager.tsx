import { useEffect, useRef } from "react";
import { useRecyclingGame } from "../lib/stores/useRecyclingGame";

export default function SoundManager() {
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const { gameState, score } = useRecyclingGame();
  const prevScoreRef = useRef(score);

  useEffect(() => {
    // Initialize audio elements
    backgroundMusicRef.current = new Audio("/sounds/background.mp3");
    hitSoundRef.current = new Audio("/sounds/hit.mp3");
    successSoundRef.current = new Audio("/sounds/success.mp3");

    // Configure background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 1.0;
    }

    // Configure sound effects
    if (hitSoundRef.current) {
      hitSoundRef.current.volume = 1.0;
    }
    
    if (successSoundRef.current) {
      successSoundRef.current.volume = 1.0;
    }

    return () => {
      // Cleanup audio elements
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Handle background music based on game state
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (gameState === 'playing') {
        backgroundMusicRef.current.play().catch(console.log);
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [gameState]);

  // Play success sound when score increases
  useEffect(() => {
    if (score > prevScoreRef.current && successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(console.log);
    }
    prevScoreRef.current = score;
  }, [score]);

  return null; // This component doesn't render anything visible
}
