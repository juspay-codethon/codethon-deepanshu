import { create } from 'zustand';
import { playMusic, stopMusic, preloadSounds, playSoundEffect } from '../utils/audioManager'; // Import audio functions

interface HighScoreEntry {
  name: string;
  score: number;
  stylePoints: number;
  date: number;
}

interface BonusEffects {
  speedBoost: number;
  jumpBoost: number;
  shield: number;
  slowMotion: number;
  magnet: number;
}

// Safe localStorage functions
// const getStorageItem = (key: string): string | null => { // Removed unused function
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem(key);
//   }
//   return null;
// };

// const setStorageItem = (key: string, value: string): void => { // Removed unused function
//   if (typeof window !== 'undefined') {
//     localStorage.setItem(key, value);
//   }
// };

// Initial state values
const initialState = {
  score: 0,
  highScore: 0,
  highScores: [] as HighScoreEntry[],
  playerName: '',
  isGameOver: false,
  isPlaying: false,
  speedMultiplier: 1,
  playerPosition: { x: 0, y: 1, z: 0 },
  playerVelocity: { x: 0, y: 0, z: 0 },
  isJumping: false,
  isSliding: false,
  canDoubleJump: true,
  hasDoubleJumped: false,
  trickJumpActive: false,
  lastDirection: 'center' as const,
  bodyLean: 0,
  jumpStartTime: 0,
  trickJumpType: 'none' as const,
  stylePoints: 0,
  bonusEffects: {
    speedBoost: 0,
    jumpBoost: 0,
    shield: 0,
    slowMotion: 0,
    magnet: 0,
  } as BonusEffects,
  lastBonusMessage: '',
} as const;

type GameState = {
  // State
  score: number;
  highScore: number;
  highScores: HighScoreEntry[];
  playerName: string;
  isGameOver: boolean;
  isPlaying: boolean;
  speedMultiplier: number;
  playerPosition: { x: number; y: number; z: number };
  playerVelocity: { x: number; y: number; z: number };
  isJumping: boolean;
  isSliding: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  trickJumpActive: boolean;
  lastDirection: 'left' | 'right' | 'center';
  bodyLean: number;
  jumpStartTime: number;
  trickJumpType: 'flip' | 'spin' | 'none';
  stylePoints: number;
  bonusEffects: BonusEffects;
  lastBonusMessage: string;

  // Actions
  setPlayerName: (name: string) => void;
  saveHighScore: () => void;
  loadHighScores: () => void;
  incrementScore: () => void;
  addBonusScore: (points: number) => void;
  addStylePoints: (points: number) => void;
  setGameOver: () => void;
  resetGame: () => void;
  startGame: () => void;
  updateSpeed: () => void;
  updateHighScore: () => void;
  loadHighScore: () => void;
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  setPlayerVelocity: (velocity: { x: number; y: number; z: number }) => void;
  setIsJumping: (jumping: boolean) => void;
  setIsSliding: (sliding: boolean) => void;
  setDirection: (direction: 'left' | 'right' | 'center') => void;
  updateBodyLean: (deltaTime: number) => void;
  startJump: () => void;
  performDoubleJump: () => void;
  startTrickJump: (type: 'flip' | 'spin') => void;
  endTrickJump: () => void;
  resetJumpState: () => void;
  activateBonus: (type: string, duration: number, value?: number) => void;
  updateBonusEffects: (deltaTime: number) => void;
  getBonusSpeedMultiplier: () => number;
  hasShield: () => boolean;
  hasJumpBoost: () => boolean;
  hasMagneticPull: () => boolean;
};

// const getInitialHighScores = (): HighScoreEntry[] => { // Removed unused function
//   try {
//     const savedScores = getStorageItem('highScores');
//     if (savedScores) {
//       return JSON.parse(savedScores);
//     }
//   } catch (error) {
//     console.error('Error loading initial high scores:', error);
//   }
//   return [];
// };

// const getInitialHighScore = (): number => { // Removed unused function
//   try {
//     const savedHighScore = getStorageItem('highScore');
//     if (savedHighScore) {
//       return parseInt(savedHighScore);
//     }
//   } catch (error) {
//     console.error('Error loading initial high score:', error);
//   }
//   return 0;
// };

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setPlayerName: (name) => {
    set({ playerName: name });
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerName', name);
    }
  },

  saveHighScore: () => {
    if (typeof window === 'undefined') return;

    const { score, playerName, stylePoints, highScores } = get();
    
    if (score > 0 && playerName) {
      const newEntry: HighScoreEntry = {
        name: playerName,
        score,
        stylePoints,
        date: Date.now()
      };

      const updatedScores = [...highScores, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      set({ highScores: updatedScores });
      localStorage.setItem('highScores', JSON.stringify(updatedScores));

      if (score > get().highScore) {
        set({ highScore: score });
        localStorage.setItem('highScore', score.toString());
      }
    }
  },

  loadHighScores: () => {
    if (typeof window === 'undefined') return;

    try {
      const savedScores = localStorage.getItem('highScores');
      const savedHighScore = localStorage.getItem('highScore');
      const savedPlayerName = localStorage.getItem('playerName');

      if (savedScores) {
        const scores = JSON.parse(savedScores) as HighScoreEntry[];
        set({ highScores: scores });
      }

      if (savedHighScore) {
        set({ highScore: parseInt(savedHighScore) });
      }

      if (savedPlayerName) {
        set({ playerName: savedPlayerName });
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  },

  incrementScore: () => {
    set((state) => ({ score: state.score + 1 }));
    get().updateSpeed();
  },
  
  addBonusScore: (points) => {
    set((state) => ({ score: state.score + points }));
    get().updateSpeed();
  },
  
  addStylePoints: (points) => {
    set((state) => ({ stylePoints: state.stylePoints + points }));
  },
  
  setGameOver: () => {
    // stopMusic(); // HUD will handle playing backgroundMusic on game over screen
    get().saveHighScore();
    set({ isGameOver: true, isPlaying: false });
  },
  
  resetGame: () => {
    // stopMusic(); // Music will be handled by HUD's useEffect based on isPlaying/isGameOver state
    set({
      score: 0,
      isGameOver: false,
      isPlaying: false,
      speedMultiplier: 1,
      playerPosition: { x: 0, y: 1, z: 0 },
      playerVelocity: { x: 0, y: 0, z: 0 },
      isJumping: false,
      isSliding: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
      trickJumpActive: false,
      lastDirection: 'center',
      bodyLean: 0,
      jumpStartTime: 0,
      trickJumpType: 'none',
      stylePoints: 0,
      bonusEffects: {
        speedBoost: 0,
        jumpBoost: 0,
        shield: 0,
        slowMotion: 0,
        magnet: 0,
      },
      lastBonusMessage: '',
    });
  },
  
  startGame: () => {
    preloadSounds(); // Ensure sounds are loaded before starting music
    set({ isPlaying: true, isGameOver: false });
    playMusic('gameplayMusic'); // Play music when game starts
  },
  
  updateSpeed: () => {
    const { score } = get();
    // More gradual speed increase:
    // Start at base speed (1.0x)
    // Increase by 5% every 10 points (faster increase)
    // Cap at 2.0x speed
    const speedIncrease = Math.floor(score / 10) * 0.05; // Changed 0.02 to 0.05
    const newSpeedMultiplier = Math.min(1 + speedIncrease, 2.0);
    set({ speedMultiplier: newSpeedMultiplier });
  },
  
  updateHighScore: () => {
    const { score, highScore } = get();
    if (score > highScore) {
      set({ highScore: score });
    }
  },
  
  loadHighScore: () => {
    const highScore = localStorage.getItem('highScore');
    if (highScore) {
      set({ highScore: parseInt(highScore) });
    }
  },
  
  setPlayerPosition: (position) =>
    set({ playerPosition: position }),
  
  setPlayerVelocity: (velocity) =>
    set({ playerVelocity: velocity }),
  
  setIsJumping: (jumping) =>
    set({ isJumping: jumping }),
  
  setIsSliding: (sliding) =>
    set({ isSliding: sliding }),
  
  setDirection: (direction) =>
    set({ lastDirection: direction }),
  
  updateBodyLean: (deltaTime) => {
    set((state) => ({ // state is used here
      bodyLean: Math.max(-1, Math.min(1, state.bodyLean + deltaTime * 0.1)),
    }));
  },
  
  startJump: () => {
    set(() => ({ // state removed as not used
      isJumping: true,
      jumpStartTime: Date.now(),
    }));
  },
  
  performDoubleJump: () => {
    set(() => ({ // state removed as not used
      hasDoubleJumped: true,
      canDoubleJump: false,
    }));
  },
  
  startTrickJump: (type) => {
    set(() => ({ // state removed as not used
      trickJumpActive: true,
      trickJumpType: type,
    }));
  },
  
  endTrickJump: () => {
    set(() => ({ // state removed as not used
      trickJumpActive: false,
    }));
  },
  
  resetJumpState: () => {
    set(() => ({ // state removed as not used
      isJumping: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
    }));
  },
  
  activateBonus: (type, duration, value) => {
    const { bonusEffects } = get();
    
    switch(type) {
      case 'score':
      case 'coin':
        // Immediate score bonus
        get().addBonusScore(value || 0);
        set({ lastBonusMessage: `+${value} Points!` });
        break;
      case 'speedBoost':
      case 'speed':
        playSoundEffect('powerUp');
        set({
          bonusEffects: { ...bonusEffects, speedBoost: duration },
          lastBonusMessage: 'Speed Boost!'
        });
        break;
      case 'jumpBoost':
      case 'jump':
        playSoundEffect('powerUp');
        set({
          bonusEffects: { ...bonusEffects, jumpBoost: duration },
          lastBonusMessage: 'Jump Boost!'
        });
        break;
      case 'shield':
        if (duration > 0) {
          playSoundEffect('powerUp');
          set({
            bonusEffects: { ...bonusEffects, shield: duration },
            lastBonusMessage: 'Shield Active!'
          });
        } else {
          // Deactivate shield (used when shield is consumed)
          set({
            bonusEffects: { ...bonusEffects, shield: 0 }
          });
        }
        break;
      case 'shieldHit':
        // Shield protected from collision
        set({
          bonusEffects: { ...bonusEffects, shield: 0 },
          lastBonusMessage: 'Shield Protected You!'
        });
        break;
      case 'slowmo':
        playSoundEffect('powerUp');
        set({
          bonusEffects: { ...bonusEffects, slowMotion: duration },
          lastBonusMessage: 'Slow Motion!'
        });
        break;
      case 'magnet':
        playSoundEffect('powerUp');
        set({
          bonusEffects: { ...bonusEffects, magnet: duration },
          lastBonusMessage: 'Coin Magnet!'
        });
        break;
    }
    
    // Clear bonus message after 2 seconds for most types
    if (type !== 'shield' || duration === 0) {
      setTimeout(() => {
        set((state) => ({ 
          ...state,
          lastBonusMessage: state.lastBonusMessage === get().lastBonusMessage ? '' : state.lastBonusMessage
        }));
      }, 2000);
    }
  },
  
  updateBonusEffects: (deltaTime) => {
    set((state) => ({
      bonusEffects: {
        ...state.bonusEffects,
        speedBoost: Math.max(0, state.bonusEffects.speedBoost - deltaTime),
        jumpBoost: Math.max(0, state.bonusEffects.jumpBoost - deltaTime),
        shield: Math.max(0, state.bonusEffects.shield - deltaTime),
        slowMotion: Math.max(0, state.bonusEffects.slowMotion - deltaTime),
        magnet: Math.max(0, state.bonusEffects.magnet - deltaTime),
      },
    }));
  },
  
  getBonusSpeedMultiplier: () => {
    const { bonusEffects } = get();
    return 1 + (bonusEffects.speedBoost * 0.05);
  },
  
  hasShield: () => {
    const { bonusEffects } = get();
    return bonusEffects.shield > 0;
  },
  
  hasJumpBoost: () => {
    const { bonusEffects } = get();
    return bonusEffects.jumpBoost > 0;
  },
  
  hasMagneticPull: () => {
    const { bonusEffects } = get();
    return bonusEffects.magnet > 0;
  },
}));

// Initialize high scores from localStorage when store is created
if (typeof window !== 'undefined') {
  const savedHighScore = localStorage.getItem('highScore');
  if (savedHighScore) {
    useGameStore.setState({ highScore: parseInt(savedHighScore) });
  }
  
  try {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
      const scores = JSON.parse(savedScores) as HighScoreEntry[];
      useGameStore.setState({ highScores: scores });
    }
  } catch (error) {
    console.error('Error loading initial high scores:', error);
  }
}
