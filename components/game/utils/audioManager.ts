import { Howl } from 'howler';

// Define sound types for better management
export type SoundEffect = 
  | 'jump' 
  | 'doubleJump'
  | 'slide'
  | 'coinCollect'
  | 'bonusCollect'
  | 'powerUp'
  | 'gameOver'
  | 'shieldHit'; // Added for when shield protects

export type MusicTrack = 
  | 'backgroundMusic'
  | 'gameplayMusic';

interface SoundManifest {
  [key: string]: {
    src: string[];
    loop?: boolean;
    volume?: number;
    html5?: boolean; // Recommended for longer tracks like music
  };
}

const soundManifest: SoundManifest = {
  // Sound Effects
  jump: { src: ['/sounds/jump.mp3'], volume: 0.7 },
  doubleJump: { src: ['/sounds/double_jump.mp3'], volume: 0.7 },
  slide: { src: ['/sounds/slide.mp3'], volume: 0.6 },
  coinCollect: { src: ['/sounds/coin_collect.mp3'], volume: 0.5 },
  bonusCollect: { src: ['/sounds/bonus_collect.mp3'], volume: 0.6 },
  powerUp: { src: ['/sounds/power_up.mp3'], volume: 0.8 },
  gameOver: { src: ['/sounds/game_over.mp3'], volume: 0.9 },
  shieldHit: { src: ['/sounds/2573-preview.mp3'], volume: 0.8 }, // Example, replace with actual shield hit sound

  // Music Tracks
  backgroundMusic: { src: ['/sounds/background_music.mp3'], loop: true, volume: 0.3, html5: true },
  gameplayMusic: { src: ['/sounds/gameplay_music.mp3'], loop: true, volume: 0.4, html5: true },
};

const sounds: { [key: string]: Howl } = {};
let currentMusic: Howl | null = null;
let currentMusicKey: MusicTrack | null = null;

// Preload all sounds
export const preloadSounds = () => {
  for (const key in soundManifest) {
    if (Object.prototype.hasOwnProperty.call(soundManifest, key)) {
      sounds[key] = new Howl(soundManifest[key]);
    }
  }
};

export const playSoundEffect = (soundName: SoundEffect): void => {
  if (sounds[soundName] && !sounds[soundName].playing()) {
    sounds[soundName].play();
  } else if (!sounds[soundName]) {
    console.warn(`Sound effect "${soundName}" not found or loaded.`);
  }
};

export const playMusic = (trackName: MusicTrack, fadeDuration: number = 500): void => {
  if (currentMusicKey === trackName && currentMusic && currentMusic.playing()) {
    return; // Already playing this track
  }

  if (currentMusic && currentMusic.playing()) {
    currentMusic.fade(currentMusic.volume(), 0, fadeDuration);
    currentMusic.once('fade', () => {
      currentMusic?.stop();
      startNewMusic(trackName, fadeDuration);
    });
  } else {
    startNewMusic(trackName, fadeDuration);
  }
};

const startNewMusic = (trackName: MusicTrack, fadeDuration: number) => {
  if (sounds[trackName]) {
    currentMusic = sounds[trackName];
    currentMusicKey = trackName;
    currentMusic.volume(0); // Start at 0 volume for fade-in
    currentMusic.play();
    currentMusic.fade(0, soundManifest[trackName].volume || 0.5, fadeDuration);
  } else {
    console.warn(`Music track "${trackName}" not found or loaded.`);
  }
};

export const stopMusic = (fadeDuration: number = 500): void => {
  if (currentMusic && currentMusic.playing()) {
    currentMusic.fade(currentMusic.volume(), 0, fadeDuration);
    currentMusic.once('fade', () => {
      currentMusic?.stop();
      currentMusic = null;
      currentMusicKey = null;
    });
  }
};

export const setMusicVolume = (volume: number, fadeDuration: number = 200): void => {
  if (currentMusic && currentMusic.playing()) {
    const targetVolume = Math.max(0, Math.min(1, volume));
    const currentVolume = currentMusic.volume();
    currentMusic.fade(currentVolume, targetVolume, fadeDuration);
  }
};

// Call preloadSounds when the module is loaded, or explicitly call it from your game's entry point.
// For simplicity here, we can call it, but in a larger app, you might manage this differently.
preloadSounds();
