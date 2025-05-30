import { create } from 'zustand';

interface BonusEffects {
  speedBoost: number; // Time remaining in seconds
  jumpBoost: number;
  shield: number;
  slowMotion: number;
  magnet: number;
}

interface GameState {
  // Game state
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
  speedMultiplier: number;
  
  // Player state
  playerPosition: { x: number; y: number; z: number };
  playerVelocity: { x: number; y: number; z: number };
  isJumping: boolean;
  
  // Enhanced Character States
  isSliding: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  trickJumpActive: boolean;
  lastDirection: 'left' | 'right' | 'center';
  bodyLean: number; // -1 to 1, for left/right lean
  jumpStartTime: number;
  trickJumpType: 'flip' | 'spin' | 'none';
  stylePoints: number;
  
  // Bonus system
  bonusEffects: BonusEffects;
  lastBonusMessage: string;
  
  // Game actions
  incrementScore: () => void;
  addBonusScore: (points: number) => void;
  addStylePoints: (points: number) => void;
  setGameOver: () => void;
  resetGame: () => void;
  startGame: () => void;
  updateSpeed: () => void;
  
  // Player actions
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  setPlayerVelocity: (velocity: { x: number; y: number; z: number }) => void;
  setIsJumping: (jumping: boolean) => void;
  
  // Enhanced Character Actions
  setIsSliding: (sliding: boolean) => void;
  setDirection: (direction: 'left' | 'right' | 'center') => void;
  updateBodyLean: (deltaTime: number) => void;
  startJump: () => void;
  performDoubleJump: () => void;
  startTrickJump: (type: 'flip' | 'spin') => void;
  endTrickJump: () => void;
  resetJumpState: () => void;
  
  // Bonus actions
  activateBonus: (type: string, duration: number, value?: number) => void;
  updateBonusEffects: (deltaTime: number) => void;
  getBonusSpeedMultiplier: () => number;
  hasShield: () => boolean;
  hasJumpBoost: () => boolean;
  hasMagneticPull: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  score: 0,
  isGameOver: false,
  isPlaying: false,
  speedMultiplier: 1,
  
  playerPosition: { x: 0, y: 1, z: 0 },
  playerVelocity: { x: 0, y: 0, z: 0 },
  isJumping: false,
  
  // Enhanced Character States
  isSliding: false,
  canDoubleJump: true,
  hasDoubleJumped: false,
  trickJumpActive: false,
  lastDirection: 'center',
  bodyLean: 0,
  jumpStartTime: 0,
  trickJumpType: 'none',
  stylePoints: 0,
  
  // Bonus system
  bonusEffects: {
    speedBoost: 0,
    jumpBoost: 0,
    shield: 0,
    slowMotion: 0,
    magnet: 0,
  },
  lastBonusMessage: '',
  
  // Game actions
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
  
  setGameOver: () =>
    set({ isGameOver: true, isPlaying: false }),
  
  resetGame: () =>
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
    }),
  
  startGame: () =>
    set({ isPlaying: true, isGameOver: false }),
  
  updateSpeed: () => {
    const { score } = get();
    // Increase speed by 5% every 5 points, capped at 2.5x speed
    const newSpeedMultiplier = Math.min(1 + (Math.floor(score / 5) * 0.05), 2.5);
    set({ speedMultiplier: newSpeedMultiplier });
  },
  
  // Player actions
  setPlayerPosition: (position) =>
    set({ playerPosition: position }),
  
  setPlayerVelocity: (velocity) =>
    set({ playerVelocity: velocity }),
  
  setIsJumping: (jumping) =>
    set({ isJumping: jumping }),
  
  // Enhanced Character Actions
  setIsSliding: (sliding) =>
    set({ isSliding: sliding }),
  
  setDirection: (direction) =>
    set({ lastDirection: direction }),
  
  updateBodyLean: (deltaTime) => {
    set((state) => ({
      bodyLean: Math.max(-1, Math.min(1, state.bodyLean + deltaTime * 0.1)),
    }));
  },
  
  startJump: () => {
    set((state) => ({
      isJumping: true,
      jumpStartTime: Date.now(),
    }));
  },
  
  performDoubleJump: () => {
    set((state) => ({
      hasDoubleJumped: true,
      canDoubleJump: false,
    }));
  },
  
  startTrickJump: (type) => {
    set((state) => ({
      trickJumpActive: true,
      trickJumpType: type,
    }));
  },
  
  endTrickJump: () => {
    set((state) => ({
      trickJumpActive: false,
    }));
  },
  
  resetJumpState: () => {
    set((state) => ({
      isJumping: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
    }));
  },
  
  // Bonus actions
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
        set({
          bonusEffects: { ...bonusEffects, speedBoost: duration },
          lastBonusMessage: 'Speed Boost!'
        });
        break;
      case 'jumpBoost':
      case 'jump':
        set({
          bonusEffects: { ...bonusEffects, jumpBoost: duration },
          lastBonusMessage: 'Jump Boost!'
        });
        break;
      case 'shield':
        if (duration > 0) {
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
        set({
          bonusEffects: { ...bonusEffects, slowMotion: duration },
          lastBonusMessage: 'Slow Motion!'
        });
        break;
      case 'magnet':
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