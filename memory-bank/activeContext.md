# Active Context - 3D Infinite Runner

## Current Focus
Setting up the foundational 3D Infinite Runner game components and architecture.

## Next Steps
1. Install required dependencies (@react-three/fiber, @react-three/drei, zustand)
2. Create core game components:
   - Player component with movement and jumping
   - Ground system with infinite scrolling tiles
   - Obstacle generation and collision detection
   - Camera controller for third-person follow
   - HUD for score and game state
3. Set up Zustand store for game state management
4. Implement keyboard controls and game loop
5. Add basic collision detection and game over logic

## Current Status
- ✅ Project structure analyzed (Next.js + TypeScript + Tailwind)
- ✅ Memory bank created
- 🔄 Setting up dependencies and core components

## Active Decisions
- Using Next.js structure with components in `/components/game/` directory
- Placeholder box geometries for initial implementation
- Simple collision detection using bounding boxes
- Score based on survival time
- Basic keyboard controls (WASD + Space)

## Known Constraints
- No external 3D assets (using basic geometries)
- Lightweight implementation for performance
- Focus on functionality over visual polish initially 