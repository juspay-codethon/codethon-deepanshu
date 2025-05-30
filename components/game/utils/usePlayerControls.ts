import { useEffect, useRef } from 'react';

interface PlayerControls {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  slide: boolean;
}

export const usePlayerControls = () => {
  const keys = useRef<PlayerControls>({
    moveLeft: false,
    moveRight: false,
    jump: false,
    slide: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.moveRight = true;
          break;
        case 'Space':
          keys.current.jump = true;
          event.preventDefault(); // Prevent page scroll
          break;
        case 'KeyS':
        case 'ArrowDown':
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.slide = true;
          event.preventDefault();
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.moveRight = false;
          break;
        case 'Space':
          keys.current.jump = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.slide = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys.current;
}; 