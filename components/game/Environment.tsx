'use client';

import { useRef, useEffect, useMemo } from 'react'; // Added useMemo
import { useFrame } from '@react-three/fiber';
// import { Group, MeshStandardMaterial } from 'three'; // Removed unused direct imports
import * as THREE from 'three'; // Added THREE
// import { useTexture } from '@react-three/drei'; // Removed useTexture
import { useGameStore } from './store/useGameStore';

const ENV_SPACING = 15;
const SIDE_DISTANCE = 8; // Distance from center track

// Tree component for grass areas
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8b4513', // Brown
    roughness: 0.8,
    metalness: 0.0,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#228b22', // Green
    roughness: 0.7,
    metalness: 0.0,
    // side: THREE.DoubleSide, // Not strictly needed for opaque spheres
  }), []);

  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} material={trunkMaterial} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
      </mesh>
      <mesh position={[0, 2.5, 0]} material={leafMaterial} castShadow>
        <sphereGeometry args={[1.2, 8, 6]} />
      </mesh>
      <mesh position={[0, 3.2, 0]} material={leafMaterial} castShadow>
        <sphereGeometry args={[0.8, 8, 6]} />
      </mesh>
    </group>
  );
};

// Rock formation for mud areas
const Rock: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const rockMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#696969', // Grey
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  return (
    <group position={position}>
      <mesh material={rockMaterial} castShadow>
        <boxGeometry args={[1.5, 1, 1.2]} />
      </mesh>
      <mesh position={[0.8, 0.3, 0.5]} material={rockMaterial} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.7]} />
      </mesh>
    </group>
  );
};

// Building for road areas
const Building: React.FC<{ position: [number, number, number]; isLeft: boolean }> = ({ position, isLeft }) => {
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d3d3d3', roughness: 0.7, metalness: 0.1 
  }), []);
  const roofMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.8 }), []);
  const windowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#87ceeb', transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.0 
  }), []);

  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} material={wallMaterial} castShadow>
        <boxGeometry args={[3, 4, 2]} />
      </mesh>
      <mesh position={[0, 4.2, 0]} material={roofMaterial} castShadow>
        <boxGeometry args={[3.2, 0.4, 2.2]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh 
          key={i}
          position={[ isLeft ? 1.51 : -1.51, 1.5 + (i % 2) * 1.2, -0.6 + (Math.floor(i / 2) * 0.6)]}
          material={windowMaterial}
        >
          <planeGeometry args={[0.4, 0.4]} /> {/* Use plane for windows */}
        </mesh>
      ))}
    </group>
  );
};

// Highway barrier and signs
const HighwayBarrier: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const concreteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0c0c0', roughness: 0.9, metalness: 0.1 }), []);
  const reflectiveMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffff00", emissive: "#dddd00", emissiveIntensity: 0.8, roughness: 0.4 }), []);

  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} material={concreteMaterial} castShadow>
        <boxGeometry args={[0.3, 0.8, 5]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={reflectiveMaterial}>
        <boxGeometry args={[0.31, 0.1, 5]} />
      </mesh>
    </group>
  );
};

const HighwaySign: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const poleMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#696969', metalness: 0.9, roughness: 0.3 }), []);
  const signMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#008000', roughness: 0.7 }), []);
  const textBgMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }), []);

  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} material={poleMaterial} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 5, 8]} />
      </mesh>
      <mesh position={[0, 4, 0]} material={signMaterial} castShadow>
        <boxGeometry args={[2, 1, 0.1]} />
      </mesh>
      <mesh position={[0, 4, 0.06]} material={textBgMaterial}> {/* Slightly in front for text */}
        <boxGeometry args={[1.8, 0.8, 0.01]} />
      </mesh>
    </group>
  );
};

interface EnvironmentElementData {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'tree' | 'rock' | 'building' | 'barrier' | 'sign';
  side: 'left' | 'right';
}

export const Environment: React.FC = () => {
  const { playerPosition, isPlaying, speedMultiplier } = useGameStore(); // Removed score
  const elementsRef = useRef<EnvironmentElementData[]>([]);

  // Removed unused getSurfaceType function and currentSurface variable

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
