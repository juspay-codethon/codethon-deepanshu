'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useGameStore } from './store/useGameStore';
import { 
  ObstacleData, 
  generateRandomObstacle, 
  generateFixedPattern,
  checkCollision, 
  cleanupObstacles,
  getDifficultyConfig
} from './utils/generateObstacles';

const PLAYER_SIZE = { width: 0.5, height: 1.8, depth: 0.3 };

interface SingleObstacleProps {
  obstacle: ObstacleData;
}

// Enhanced obstacle renderer with creative 3D models
const SingleObstacle: React.FC<SingleObstacleProps> = ({ obstacle }) => {
  const { position, size, color, type } = obstacle;

  // Natural Obstacles Components
  const FallenLog = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Main log body */}
      <mesh rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[size.height/2, size.height/2, size.depth, 8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8} 
          normalScale={[1, 1]}
        />
      </mesh>
      {/* Log rings for detail */}
      <mesh position={[0, 0, size.depth/2 - 0.1]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[size.height/2 + 0.02, size.height/2 + 0.02, 0.05, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -size.depth/2 + 0.1]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[size.height/2 + 0.02, size.height/2 + 0.02, 0.05, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
    </group>
  );

  const Boulder = () => (
    <mesh position={[position.x, position.y, position.z]} castShadow>
      <dodecahedronGeometry args={[size.width/1.5]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.9} 
        metalness={0.1}
        normalScale={[2, 2]}
      />
    </mesh>
  );

  const Stream = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Water surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7} 
          roughness={0.1} 
          metalness={0.8}
        />
      </mesh>
      {/* Stream banks */}
      <mesh position={[-size.width/2 - 0.1, size.height/2, 0]} castShadow>
        <boxGeometry args={[0.2, size.height*2, size.depth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      <mesh position={[size.width/2 + 0.1, size.height/2, 0]} castShadow>
        <boxGeometry args={[0.2, size.height*2, size.depth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    </group>
  );

  const TallGrass = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Grass clumps */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size.width / 3;
        const x = Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
        const z = Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
        const height = size.height * (0.8 + Math.random() * 0.4);
        
        return (
          <mesh key={i} position={[x, height/2, z]} castShadow>
            <boxGeometry args={[0.02, height, 0.02]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );

  const FlowerBed = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Soil base */}
      <mesh position={[0, -size.height/4, 0]} receiveShadow>
        <boxGeometry args={[size.width, size.height/2, size.depth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Flowers */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (Math.random() - 0.5) * size.width * 0.8;
        const z = (Math.random() - 0.5) * size.depth * 0.8;
        
        return (
          <group key={i} position={[x, size.height/2, z]}>
            {/* Stem */}
            <mesh position={[0, -size.height/4, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, size.height/2]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Flower */}
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );

  // Farm Obstacles Components
  const HayBale = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Main bale */}
      <mesh rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[size.height/2, size.height/2, size.width, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Binding straps */}
      <mesh position={[0, 0, -size.width/3]} castShadow>
        <boxGeometry args={[size.height + 0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, 0, size.width/3]} castShadow>
        <boxGeometry args={[size.height + 0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );

  const Scarecrow = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Post */}
      <mesh position={[0, -size.height/4, 0]} castShadow>
        <boxGeometry args={[0.1, size.height/2, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Body */}
      <mesh position={[0, size.height/4, 0]} castShadow>
        <boxGeometry args={[size.width*0.8, size.height/2, size.depth*0.8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Arms */}
      <mesh position={[0, size.height/3, 0]} castShadow>
        <boxGeometry args={[size.width*1.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Head */}
      <mesh position={[0, size.height*0.75, 0]} castShadow>
        <sphereGeometry args={[size.width/4]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
    </group>
  );

  const Fence = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Post */}
      <mesh castShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Wire/rail (if part of fence line) */}
      <mesh position={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.02, 0.02]} />
        <meshStandardMaterial color="#696969" metalness={0.8} />
      </mesh>
    </group>
  );

  const FarmGate = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Gate frame */}
      <mesh castShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Gate rails */}
      <mesh position={[0, size.height/4, size.depth/2 + 0.01]} castShadow>
        <boxGeometry args={[size.width*0.9, 0.05, 0.02]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, -size.height/4, size.depth/2 + 0.01]} castShadow>
        <boxGeometry args={[size.width*0.9, 0.05, 0.02]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );

  const MudPatch = () => (
    <group position={[position.x, position.y, position.z]}>
      {/* Mud surface */}
      <mesh receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>
      {/* Puddle reflections */}
      {Array.from({ length: 3 }, (_, i) => {
        const x = (Math.random() - 0.5) * size.width * 0.6;
        const z = (Math.random() - 0.5) * size.depth * 0.6;
        
        return (
          <mesh key={i} position={[x, size.height/2 + 0.01, z]}>
            <circleGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#4169E1" 
              transparent 
              opacity={0.6} 
              roughness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );

  // Fallback for original obstacles
  const GenericObstacle = () => (
    <mesh position={[position.x, position.y, position.z]} castShadow>
      <boxGeometry args={[size.width, size.height, size.depth]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );

  // Render appropriate obstacle type
  switch (type) {
    case 'fallen_log': return <FallenLog />;
    case 'boulder': return <Boulder />;
    case 'stream': return <Stream />;
    case 'tall_grass': return <TallGrass />;
    case 'flower_bed': return <FlowerBed />;
    case 'hay_bale': return <HayBale />;
    case 'scarecrow': return <Scarecrow />;
    case 'fence': return <Fence />;
    case 'farm_gate': return <FarmGate />;
    case 'mud_patch': return <MudPatch />;
    default: return <GenericObstacle />;
  }
};

export const Obstacle: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const obstaclesRef = useRef<ObstacleData[]>([]);
  const lastPatternZ = useRef<number>(0);
  
  const {
    playerPosition,
    isPlaying,
    speedMultiplier,
    score,
    isSliding,
    incrementScore,
    setGameOver,
    hasShield,
    activateBonus,
    addStylePoints,
  } = useGameStore();

  // Get current difficulty configuration
  const difficulty = getDifficultyConfig(score);

  // Initialize obstacles
  useEffect(() => {
    if (isPlaying && obstaclesRef.current.length === 0) {
      // Generate initial random obstacles
      for (let i = 0; i < 3; i++) {
        const newObstacle = generateRandomObstacle(
          playerPosition.z + 20 + i * 20, 
          obstaclesRef.current, 
          speedMultiplier,
          score
        );
        obstaclesRef.current.push(newObstacle);
      }
      lastPatternZ.current = playerPosition.z;
    }
  }, [isPlaying, playerPosition.z, speedMultiplier, score]);

  useFrame(() => { // Removed state and delta
    if (!isPlaying) return;

    // Check for collisions with enhanced sliding detection
    obstaclesRef.current.forEach((obstacle) => {
      if (checkCollision(playerPosition, PLAYER_SIZE, obstacle, isSliding)) {
        // Check if player has shield protection
        if (hasShield()) {
          // Shield absorbs the hit - deactivate shield and remove obstacle
          activateBonus('shield', 0, 0); // Deactivate shield
          obstacle.active = false; // Remove the obstacle
          
          // Add a shield hit message
          activateBonus('shieldHit', 0, 0); // This will show a message
        } else {
          // No shield - game over
          setGameOver();
          return;
        }
      }

      // Enhanced scoring with style points for sliding under obstacles
      if (obstacle.active && obstacle.position.z < playerPosition.z - 2) {
        obstacle.active = false;
        incrementScore();
        
        // === CREATIVE OBSTACLE STYLE POINTS ===
        
        // Special bonuses for creative obstacle interactions
        if (isSliding) {
          switch (obstacle.type) {
            case 'mud_patch':
              addStylePoints(5); // Sliding through mud is encouraged!
              break;
            case 'fallen_log':
              addStylePoints(4); // Stylish log slide
              break;
            case 'hay_bale':
              addStylePoints(4); // Smooth hay bale slide
              break;
            case 'tall_grass':
              addStylePoints(3); // Grass surfing
              break;
            case 'farm_gate':
              addStylePoints(6); // Precise gate slide
              break;
            case 'low':
            case 'barrier':
              addStylePoints(3); // Standard sliding bonus
              break;
          }
        }
        
        // Jumping bonuses (detected by player height during obstacle passage)
        if (playerPosition.y > 2.5) { // High jump detection
          switch (obstacle.type) {
            case 'stream':
              addStylePoints(7); // Perfect stream jump
              break;
            case 'flower_bed':
              addStylePoints(6); // Preserve the flowers!
              break;
            case 'boulder':
              addStylePoints(5); // Boulder hop
              break;
            case 'scarecrow':
              addStylePoints(4); // Scarecrow leap
              break;
            case 'fence':
              addStylePoints(3); // Fence hurdle
              break;
          }
        }
        
        // Special combinations and trick potential
        if (obstacle.type === 'hay_bale' && playerPosition.y > 2.0) {
          addStylePoints(8); // Hay bale trick jump platform
        }
      }
    });

    // Clean up old obstacles
    obstaclesRef.current = cleanupObstacles(obstaclesRef.current, playerPosition.z);

    // Generate new obstacles if needed - using dynamic max obstacles
    if (obstaclesRef.current.length < difficulty.maxObstacles) {
      // Use difficulty-based pattern frequency instead of fixed 20%
      if (Math.random() < difficulty.patternFrequency && playerPosition.z > lastPatternZ.current + 60) {
        const patternObstacles = generateFixedPattern(playerPosition.z, obstaclesRef.current, speedMultiplier, score);
        obstaclesRef.current.push(...patternObstacles);
        lastPatternZ.current = Math.max(...patternObstacles.map(obs => obs.position.z));
      } else {
        // Generate random obstacle
        const newObstacle = generateRandomObstacle(playerPosition.z, obstaclesRef.current, speedMultiplier, score);
        obstaclesRef.current.push(newObstacle);
      }
    }
  });

  // Reset obstacles when game resets
  useEffect(() => {
    if (!isPlaying) {
      obstaclesRef.current = [];
      lastPatternZ.current = 0;
    }
  }, [isPlaying]);

  return (
    <group ref={groupRef}>
      {obstaclesRef.current.map((obstacle) => (
        <SingleObstacle key={obstacle.id} obstacle={obstacle} />
      ))}
    </group>
  );
};
