'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, Group } from 'three';
import { useGameStore } from './store/useGameStore';

// Fixed sky theme for consistent appearance - completely static
const FIXED_SKY_THEME = {
  top: '#87ceeb',      // Light sky blue - completely static
  middle: '#87ceeb',   // Same color for consistency  
  bottom: '#87ceeb',   // Same color for consistency
  clouds: '#ffffff'    // Pure white clouds
};

const Cloud: React.FC<{ position: [number, number, number]; scale: number; cloudId: number }> = ({ 
  position, 
  scale,
  cloudId 
}) => {
  const cloudRef = useRef<Mesh>(null);
  const { isPlaying } = useGameStore();
  
  // Reset cloud position when game restarts
  useEffect(() => {
    if (cloudRef.current && isPlaying) {
      cloudRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [isPlaying, position]);
  
  useFrame((state) => {
    if (cloudRef.current && isPlaying) {
      // Slowly move clouds - very subtle movement
      cloudRef.current.position.x += 0.001; // Reduced from 0.002 for more subtle effect
      if (cloudRef.current.position.x > 30) {
        cloudRef.current.position.x = -30;
      }
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[3, 8, 6]} />
        <meshBasicMaterial color={FIXED_SKY_THEME.clouds} transparent opacity={0.6} />
      </mesh>
      <mesh position={[2.5, 0, 0]}>
        <sphereGeometry args={[2.5, 8, 6]} />
        <meshBasicMaterial color={FIXED_SKY_THEME.clouds} transparent opacity={0.5} />
      </mesh>
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[2, 8, 6]} />
        <meshBasicMaterial color={FIXED_SKY_THEME.clouds} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export const Sky: React.FC = () => {
  const { isPlaying, playerPosition, speedMultiplier } = useGameStore();
  const skyGroupRef = useRef<Group>(null);

  // Generate clouds - reset when game restarts
  const clouds = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 60,
        15 + Math.random() * 10,
        (Math.random() - 0.5) * 100
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 0.8,
    }));
  }, [isPlaying]);

  // Sync sky movement with player for visual consistency - reduced movement
  useFrame((state, delta) => {
    if (!isPlaying || !skyGroupRef.current) return;
    
    // Minimal sky movement to prevent depth conflicts
    const skyScrollSpeed = 12 * speedMultiplier * 0.005; // Reduced from 0.02 to 0.005
    skyGroupRef.current.position.z -= skyScrollSpeed * delta;
  });

  return (
    <group ref={skyGroupRef}>
      {/* Fixed Sky Dome - reduced size and repositioned */}
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <sphereGeometry args={[100, 32, 16]} />
        <meshBasicMaterial 
          color={FIXED_SKY_THEME.top}
          side={2} // THREE.BackSide
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Animated Clouds */}
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          position={cloud.position}
          scale={cloud.scale}
          cloudId={cloud.id}
        />
      ))}

      {/* Fixed sun position */}
      <mesh position={[40, 30, -50]} renderOrder={1}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial 
          color="#ffeaa7" 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}; 