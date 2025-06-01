'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useGameStore } from './store/useGameStore';

const ENV_SPACING = 15;
const SIDE_DISTANCE = 8; // Distance from center track

// Tree component for grass areas
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Trunk */}
    <mesh position={[0, 1, 0]}>
      <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
    {/* Leaves */}
    <mesh position={[0, 2.5, 0]}>
      <sphereGeometry args={[1.2, 8, 6]} />
      <meshStandardMaterial color="#228b22" />
    </mesh>
    <mesh position={[0, 3.2, 0]}>
      <sphereGeometry args={[0.8, 8, 6]} />
      <meshStandardMaterial color="#32cd32" />
    </mesh>
  </group>
);

// Rock formation for mud areas
const Rock: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[1.5, 1, 1.2]} />
      <meshStandardMaterial color="#696969" />
    </mesh>
    <mesh position={[0.8, 0.3, 0.5]}>
      <boxGeometry args={[0.8, 0.6, 0.7]} />
      <meshStandardMaterial color="#778899" />
    </mesh>
  </group>
);

// Building for road areas
const Building: React.FC<{ position: [number, number, number]; isLeft: boolean }> = ({ position, isLeft }) => (
  <group position={position}>
    {/* Main building */}
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[3, 4, 2]} />
      <meshStandardMaterial color="#d3d3d3" />
    </mesh>
    {/* Roof */}
    <mesh position={[0, 4.2, 0]}>
      <boxGeometry args={[3.2, 0.4, 2.2]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
    {/* Windows */}
    {Array.from({ length: 6 }, (_, i) => (
      <mesh 
        key={i}
        position={[
          isLeft ? 1.51 : -1.51, 
          1.5 + (i % 2) * 1.2, 
          -0.6 + (Math.floor(i / 2) * 0.6)
        ]}
      >
        <boxGeometry args={[0.02, 0.4, 0.4]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
    ))}
  </group>
);

// Highway barrier and signs
const HighwayBarrier: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Concrete barrier */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.3, 0.8, 5]} />
      <meshStandardMaterial color="#c0c0c0" />
    </mesh>
    {/* Reflective strips */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.31, 0.1, 5]} />
      <meshStandardMaterial color="#ffff00" />
    </mesh>
  </group>
);

// Sign post for highway
const HighwaySign: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Post */}
    <mesh position={[0, 2.5, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 5, 8]} />
      <meshStandardMaterial color="#696969" />
    </mesh>
    {/* Sign */}
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[2, 1, 0.1]} />
      <meshStandardMaterial color="#008000" />
    </mesh>
    {/* Sign text background */}
    <mesh position={[0, 4, 0.06]}>
      <boxGeometry args={[1.8, 0.8, 0.01]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

interface EnvironmentElementData {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'tree' | 'rock' | 'building' | 'barrier' | 'sign';
  side: 'left' | 'right';
}

export const Environment: React.FC = () => {
  const { playerPosition, isPlaying, speedMultiplier, score } = useGameStore();
  const elementsRef = useRef<EnvironmentElementData[]>([]);

  // Get current surface type - now always grass
  const getSurfaceType = (currentScore: number) => {
    // Always return grass for infinite grass gameplay
    return 'grass';
    
    // Original progression (commented out):
    // const progressDistance = currentScore * 5;
    // if (progressDistance < 50) return 'grass';
    // if (progressDistance < 150) return 'mud';
    // if (progressDistance < 300) return 'road';
    // return 'highway';
  };

  const currentSurface = getSurfaceType(score);

  // Generate environment elements - now always trees for grass
  const generateEnvironmentElement = (z: number, side: 'left' | 'right'): EnvironmentElementData => {
    // Always generate trees for grass surface
    const type: EnvironmentElementData['type'] = 'tree';

    return {
      id: `env-${Date.now()}-${Math.random()}`,
      position: {
        x: side === 'left' ? -SIDE_DISTANCE : SIDE_DISTANCE,
        y: 0,
        z: z + (Math.random() - 0.5) * 5, // Add some randomness
      },
      type,
      side,
    };
  };

  // Reset elements when game resets
  useEffect(() => {
    if (!isPlaying) {
      elementsRef.current = [];
    }
  }, [isPlaying]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const currentForwardSpeed = 12 * speedMultiplier;

    // Update existing elements positions
    elementsRef.current.forEach((element) => {
      element.position.z -= currentForwardSpeed * delta;
    });

    // Remove elements that are too far behind
    elementsRef.current = elementsRef.current.filter(
      (element) => element.position.z > playerPosition.z - 50
    );

    // Generate new elements ahead
    const furthestZ = elementsRef.current.length > 0 
      ? Math.max(...elementsRef.current.map(el => el.position.z))
      : playerPosition.z;

    // Generate elements for both sides
    if (furthestZ < playerPosition.z + 100) {
      const newZ = furthestZ + ENV_SPACING + Math.random() * 10;
      
      // Add element to left side
      if (Math.random() < 0.8) { // 80% chance
        elementsRef.current.push(generateEnvironmentElement(newZ, 'left'));
      }
      
      // Add element to right side
      if (Math.random() < 0.8) { // 80% chance
        elementsRef.current.push(generateEnvironmentElement(newZ + Math.random() * 5, 'right'));
      }
    }
  });

  return (
    <group>
      {elementsRef.current.map((element) => {
        const position: [number, number, number] = [
          element.position.x,
          element.position.y,
          element.position.z
        ];

        switch (element.type) {
          case 'tree':
            return <Tree key={element.id} position={position} />;
          case 'rock':
            return <Rock key={element.id} position={position} />;
          case 'building':
            return <Building key={element.id} position={position} isLeft={element.side === 'left'} />;
          case 'barrier':
            return <HighwayBarrier key={element.id} position={position} />;
          case 'sign':
            return <HighwaySign key={element.id} position={position} />;
          default:
            return null;
        }
      })}
    </group>
  );
}; 