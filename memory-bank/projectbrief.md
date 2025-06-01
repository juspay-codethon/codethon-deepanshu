# 3D Infinite Runner Game - Project Brief

## Project Overview
Building a 3D Infinite Runner game using React and Three.js with @react-three/fiber and @react-three/drei. The game features a third-person perspective where the player controls a cube/character that runs forward on an infinite track, avoiding randomly generated obstacles.

## Core Requirements
- **Platform**: Next.js + TypeScript + Tailwind CSS
- **3D Framework**: @react-three/fiber (React bindings for Three.js)
- **3D Helpers**: @react-three/drei
- **State Management**: Zustand for game state
- **UI**: Tailwind CSS for HUD components
- **Assets**: Basic geometries (no external 3D assets initially)

## Game Mechanics
1. **Player Control**: Cube that auto-runs forward, can strafe left/right (A/D or ←/→), jump (Space)
2. **Infinite Ground**: Tile system that scrolls backward and loops
3. **Obstacles**: Random generation with collision detection
4. **Camera**: Third-person follow camera
5. **Scoring**: Based on survival time/distance
6. **Game States**: Running, Game Over, Reset

## Technical Goals
- Lightweight run logic
- Smooth animations using useFrame
- Keyboard controls
- Collision detection
- Game state management
- HUD interface

## Success Criteria
- Functional infinite runner with placeholder boxes
- Responsive controls and smooth camera
- Working collision system
- Score tracking and game over/reset flow 