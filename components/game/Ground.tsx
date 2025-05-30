'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useGameStore } from './store/useGameStore';

const TILE_SIZE = 20;
const TILE_OVERLAP = 0.8; // Increased overlap for better high-speed coverage
const NUM_TILES = 35; // Increased significantly for high-speed gameplay
const BASE_FORWARD_SPEED = 12;

// Surface types with enhanced PBR materials
const SURFACE_TYPES = {
  grass: { 
    color: '#22c55e', 
    roughness: 0.9, 
    metalness: 0.0,
    emissive: '#001a00',
    emissiveIntensity: 0.05
  },
  mud: { 
    color: '#92400e', 
    roughness: 0.95, 
    metalness: 0.0,
    emissive: '#1a0800',
    emissiveIntensity: 0.02
  },
  road: { 
    color: '#374151', 
    roughness: 0.3, 
    metalness: 0.1,
    emissive: '#0a0a0a',
    emissiveIntensity: 0.01
  },
  highway: { 
    color: '#1f2937', 
    roughness: 0.2, 
    metalness: 0.3,
    emissive: '#0f0f0f',
    emissiveIntensity: 0.02
  }
};

interface TileProps {
  position: [number, number, number];
  surfaceType: keyof typeof SURFACE_TYPES;
  tileIndex: number;
}

const Tile: React.FC<TileProps> = ({ position, surfaceType, tileIndex }) => {
  const surface = SURFACE_TYPES[surfaceType];
  
  return (
    <group position={position}>
      {/* Extra wide base layer for complete coverage */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[TILE_SIZE + 2, 0.2, TILE_SIZE + 2]} />
        <meshStandardMaterial 
          color={surface.color} 
          roughness={surface.roughness}
          metalness={surface.metalness}
          emissive={surface.emissive}
          emissiveIntensity={surface.emissiveIntensity}
        />
      </mesh>
      
      {/* Main ground tile - larger to prevent gaps */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[TILE_SIZE + 1, 0.4, TILE_SIZE + 1]} />
        <meshStandardMaterial 
          color={surface.color} 
          roughness={surface.roughness}
          metalness={surface.metalness}
          emissive={surface.emissive}
          emissiveIntensity={surface.emissiveIntensity}
        />
      </mesh>
      
      {/* Top layer for visual consistency */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
        <meshStandardMaterial 
          color={surface.color} 
          roughness={surface.roughness}
          metalness={surface.metalness}
          emissive={surface.emissive}
          emissiveIntensity={surface.emissiveIntensity * 1.2}
        />
      </mesh>
      
      {/* Grass details - using tileIndex for consistent positioning */}
      {surfaceType === 'grass' && (
        <>
          {Array.from({ length: 12 }, (_, i) => {
            // Use tileIndex and i for consistent seeded random positioning
            const seedX = Math.sin(tileIndex * 0.1 + i * 0.3) * TILE_SIZE * 0.4;
            const seedZ = Math.cos(tileIndex * 0.15 + i * 0.25) * TILE_SIZE * 0.4;
            return (
              <mesh 
                key={i}
                position={[seedX, 0.25, seedZ]}
                receiveShadow
                castShadow
              >
                <boxGeometry args={[0.15, 0.3, 0.15]} />
                <meshStandardMaterial 
                  color="#15803d" 
                  roughness={0.8}
                  metalness={0.0}
                  emissive="#002200"
                  emissiveIntensity={0.1}
                />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

export const Ground: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const { playerPosition, isPlaying, speedMultiplier, score } = useGameStore();

  // Always return grass for infinite grass gameplay
  const getSurfaceType = (): keyof typeof SURFACE_TYPES => 'grass';

  // Create initial tiles with maximum coverage
  const tiles = useMemo(() => {
    return Array.from({ length: NUM_TILES }, (_, i) => ({
      id: i,
      z: (i - Math.floor(NUM_TILES / 2)) * (TILE_SIZE - TILE_OVERLAP),
      surfaceType: getSurfaceType(),
    }));
  }, [isPlaying]);

  const tilesRef = useRef(tiles);

  // Reset tiles when game restarts
  useEffect(() => {
    if (isPlaying) {
      tilesRef.current = Array.from({ length: NUM_TILES }, (_, i) => ({
        id: i,
        z: (i - Math.floor(NUM_TILES / 2)) * (TILE_SIZE - TILE_OVERLAP),
        surfaceType: getSurfaceType(),
      }));
    }
  }, [isPlaying]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const tileSpacing = TILE_SIZE - TILE_OVERLAP;
    
    // Calculate dynamic recycling distance based on speed multiplier
    // Higher speed = recycle tiles further ahead to prevent gaps
    const recycleDistance = Math.max(TILE_SIZE * 4, TILE_SIZE * 2 * speedMultiplier);
    const aheadDistance = Math.max(TILE_SIZE * 6, TILE_SIZE * 4 * speedMultiplier);

    // More aggressive tile recycling with speed-based adjustments
    tilesRef.current.forEach((tile, index) => {
      // Recycle tiles based on dynamic distance that scales with speed
      if (tile.z < playerPosition.z - recycleDistance) {
        const furthestTileZ = Math.max(...tilesRef.current.map(t => t.z));
        tile.z = furthestTileZ + tileSpacing;
        tile.surfaceType = getSurfaceType();
      }
    });

    // Ensure we always have tiles far enough ahead for high speeds
    const furthestTileZ = Math.max(...tilesRef.current.map(t => t.z));
    if (furthestTileZ < playerPosition.z + aheadDistance) {
      // Add emergency tiles if we're running out of coverage ahead
      const tilesNeeded = Math.ceil((playerPosition.z + aheadDistance - furthestTileZ) / tileSpacing);
      for (let i = 0; i < Math.min(tilesNeeded, 5); i++) {
        // Find tiles that are far behind and reposition them ahead
        const oldestTile = tilesRef.current.reduce((oldest, tile) => 
          tile.z < oldest.z ? tile : oldest
        );
        oldestTile.z = furthestTileZ + tileSpacing * (i + 1);
        oldestTile.surfaceType = getSurfaceType();
      }
    }

    // Additional safety check - ensure tiles are properly distributed
    tilesRef.current.sort((a, b) => a.z - b.z);
    for (let i = 1; i < tilesRef.current.length; i++) {
      const currentTile = tilesRef.current[i];
      const prevTile = tilesRef.current[i - 1];
      const expectedZ = prevTile.z + tileSpacing;
      
      // Fix any gaps that might have appeared with tolerance for overlap
      if (Math.abs(currentTile.z - expectedZ) > tileSpacing * 0.5) {
        currentTile.z = expectedZ;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Multiple background layers for bulletproof coverage */}
      
      {/* Deep background plane - static for performance */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[100, 0.5, 1000]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Moving background plane that follows player */}
      <mesh position={[0, -0.3, playerPosition.z]} receiveShadow>
        <boxGeometry args={[50, 0.2, 500]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Near-surface backup plane */}
      <mesh position={[0, -0.15, playerPosition.z]} receiveShadow>
        <boxGeometry args={[30, 0.1, 300]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* Main tiles with enhanced coverage */}
      {tilesRef.current.map((tile, index) => (
        <Tile 
          key={`tile-${tile.id}`}
          position={[0, 0, tile.z]} 
          surfaceType={tile.surfaceType}
          tileIndex={index}
        />
      ))}
      
      {/* Emergency safety ground */}
      <mesh position={[0, -10, playerPosition.z]} receiveShadow>
        <boxGeometry args={[100, 1, 500]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0} />
      </mesh>
    </group>
  );
}; 