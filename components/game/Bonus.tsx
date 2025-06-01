'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { useGameStore } from './store/useGameStore';
import { 
  BonusData,
  generateRandomBonus,
  shouldSpawnBonus,
  checkBonusCollection,
  cleanupBonuses
} from './utils/generateBonuses';

const PLAYER_SIZE = { width: 0.5, height: 1.8, depth: 0.3 };
const MAGNETIC_FORCE = 8; // How strong the magnetic pull is
const MAGNETIC_COLLECTION_DISTANCE = 0.8; // Auto-collect when this close

interface SingleBonusProps {
  bonus: BonusData;
  magnetPosition?: Vector3;
  isBeingMagnetized: boolean;
}

const SingleBonus: React.FC<SingleBonusProps> = ({ bonus, magnetPosition, isBeingMagnetized }) => {
  const meshRef = useRef<Mesh>(null);
  const originalPositionRef = useRef(new Vector3(bonus.position.x, bonus.position.y, bonus.position.z));
  const magnetTargetRef = useRef<Vector3 | null>(null);
  
  // Handle magnetic attraction
  useFrame((state, delta) => {
    if (meshRef.current && bonus.active) {
      const time = state.clock.elapsedTime;
      
      if (isBeingMagnetized && magnetPosition) {
        // Calculate magnetic force direction
        const currentPos = new Vector3(
          meshRef.current.position.x,
          meshRef.current.position.y,
          meshRef.current.position.z
        );
        
        const direction = magnetPosition.clone().sub(currentPos);
        const distance = direction.length();
        
        if (distance > MAGNETIC_COLLECTION_DISTANCE) {
          // Apply magnetic force
          direction.normalize();
          direction.multiplyScalar(MAGNETIC_FORCE * delta);
          
          meshRef.current.position.add(direction);
          
          // Enhanced visual effects when being magnetized
          meshRef.current.scale.setScalar(1.2 + Math.sin(time * 8) * 0.2);
          
          // Spinning effect during magnetization
          meshRef.current.rotation.y += 0.1;
          meshRef.current.rotation.x += 0.08;
        }
      } else {
        // Normal floating animation
        meshRef.current.position.y = originalPositionRef.current.y + 
          Math.sin(time * 3 + bonus.position.x) * 0.3 + 
          Math.sin(time * 1.5 + bonus.position.z) * 0.1;
        
        // Normal rotation and scale
        meshRef.current.rotation.y += 0.02 + Math.sin(time * 0.5) * 0.01;
        meshRef.current.rotation.x = Math.sin(time * 2 + bonus.position.x) * 0.15;
        meshRef.current.rotation.z = Math.cos(time * 1.8 + bonus.position.z) * 0.1;
        
        const scale = 1 + Math.sin(time * 4 + bonus.position.x * 0.1) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  // Enhanced geometry with more detail
  const getGeometry = () => {
    switch (bonus.type) {
      case 'coin':
        return <cylinderGeometry args={[bonus.size.width/2, bonus.size.width/2, bonus.size.depth, 16]} />;
      case 'score':
        return <boxGeometry args={[bonus.size.width, bonus.size.height, bonus.size.depth]} />;
      case 'speed':
        return <coneGeometry args={[bonus.size.width/2, bonus.size.height, 8]} />;
      case 'jump':
        return <tetrahedronGeometry args={[bonus.size.width/2, 1]} />;
      case 'shield':
        return <octahedronGeometry args={[bonus.size.width/2, 2]} />;
      case 'slowmo':
        return <icosahedronGeometry args={[bonus.size.width/2, 1]} />;
      case 'magnet':
        return <sphereGeometry args={[bonus.size.width/2, 16, 12]} />;
      default:
        return <sphereGeometry args={[bonus.size.width/2, 12, 8]} />;
    }
  };

  // Enhanced material properties based on bonus type
  const getMaterialProps = () => {
    const baseProps = {
      color: bonus.color,
      emissive: bonus.color,
      emissiveIntensity: isBeingMagnetized ? 0.8 : 0.4, // Brighter when magnetized
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9,
    };

    switch (bonus.type) {
      case 'coin':
        return { ...baseProps, metalness: 1.0, roughness: 0.05, emissiveIntensity: isBeingMagnetized ? 0.6 : 0.3 };
      case 'shield':
        return { ...baseProps, metalness: 0.8, roughness: 0.2, emissiveIntensity: isBeingMagnetized ? 0.8 : 0.5, opacity: 0.8 };
      case 'speed':
        return { ...baseProps, metalness: 0.7, roughness: 0.3, emissiveIntensity: isBeingMagnetized ? 0.9 : 0.6 };
      default:
        return baseProps;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[bonus.position.x, bonus.position.y, bonus.position.z]}
      castShadow
      receiveShadow
    >
      {getGeometry()}
      <meshStandardMaterial {...getMaterialProps()} />
      
      {/* Magnetic Field Effect */}
      {isBeingMagnetized && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[bonus.size.width, 16, 16]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent 
            opacity={0.2}
            emissive="#00ffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </mesh>
  );
};

export const Bonus: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const bonusesRef = useRef<BonusData[]>([]);
  const [magneticPullActive, setMagneticPullActive] = useState(false);
  const [magnetPosition, setMagnetPosition] = useState<Vector3>(new Vector3());
  const [magnetRange, setMagnetRange] = useState(3);
  
  const {
    playerPosition,
    isPlaying,
    score,
    activateBonus,
    updateBonusEffects,
    hasMagneticPull,
  } = useGameStore();

  // Listen for magnetic pull events from Player
  useEffect(() => {
    const handleMagneticPull = (event: CustomEvent) => {
      const { playerPosition: pos, range } = event.detail;
      setMagnetPosition(new Vector3(pos.x, pos.y, pos.z));
      setMagnetRange(range);
      setMagneticPullActive(hasMagneticPull());
    };

    window.addEventListener('magneticPull', handleMagneticPull as EventListener);
    
    return () => {
      window.removeEventListener('magneticPull', handleMagneticPull as EventListener);
    };
  }, [hasMagneticPull]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Update bonus effects timers
    updateBonusEffects(delta);

    // Update magnetic pull state
    setMagneticPullActive(hasMagneticPull());

    // Check for bonus collections (including magnetic auto-collection)
    bonusesRef.current.forEach((bonus) => {
      let shouldCollect = false;
      
      // Normal collision detection
      if (checkBonusCollection(playerPosition, PLAYER_SIZE, bonus)) {
        shouldCollect = true;
      }
      
      // Magnetic auto-collection
      if (magneticPullActive && bonus.active) {
        const bonusPos = new Vector3(bonus.position.x, bonus.position.y, bonus.position.z);
        const distance = magnetPosition.distanceTo(bonusPos);
        
        if (distance <= MAGNETIC_COLLECTION_DISTANCE) {
          shouldCollect = true;
        }
      }
      
      if (shouldCollect) {
        bonus.collected = true;
        bonus.active = false;
        
        // Activate the bonus effect
        if (bonus.type === 'coin' || bonus.type === 'score') {
          activateBonus(bonus.type, 0, bonus.value);
        } else {
          activateBonus(bonus.type, bonus.value, bonus.value);
        }
      }
    });

    // Clean up old bonuses
    bonusesRef.current = cleanupBonuses(bonusesRef.current, playerPosition.z);

    // Spawn new bonuses
    if (shouldSpawnBonus(bonusesRef.current, playerPosition.z, score)) {
      const newBonus = generateRandomBonus(playerPosition.z, bonusesRef.current, score);
      bonusesRef.current.push(newBonus);
    }
  });

  // Reset bonuses when game resets
  useEffect(() => {
    if (!isPlaying) {
      bonusesRef.current = [];
    }
  }, [isPlaying]);

  return (
    <group ref={groupRef}>
      {bonusesRef.current
        .filter(bonus => bonus.active)
        .map((bonus) => {
          // Check if this bonus is within magnetic range
          const bonusPos = new Vector3(bonus.position.x, bonus.position.y, bonus.position.z);
          const isInMagnetRange = magneticPullActive && 
            magnetPosition.distanceTo(bonusPos) <= magnetRange;
          
          return (
            <SingleBonus 
              key={bonus.id} 
              bonus={bonus} 
              magnetPosition={isInMagnetRange ? magnetPosition : undefined}
              isBeingMagnetized={isInMagnetRange}
            />
          );
        })}
    </group>
  );
}; 