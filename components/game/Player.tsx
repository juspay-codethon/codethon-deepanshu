'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { useGameStore } from './store/useGameStore';
import { usePlayerControls } from './utils/usePlayerControls';

const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 12;
const DOUBLE_JUMP_FORCE = 8;
const GRAVITY = -25;
const GROUND_Y = 1;
const SLIDING_Y = 0.3; // Lower position when sliding
const LANE_WIDTH = 2;
const BASE_FORWARD_SPEED = 12;
const TRICK_JUMP_THRESHOLD = 1.5; // Jump duration for tricks
const MAGNETIC_RANGE = 3; // Range for magnetic pull
const LEAN_SPEED = 8; // How fast body leans during turns

// Enhanced Human character component with all abilities
const RunningHuman: React.FC<{ 
  position: [number, number, number]; 
  isRunning: boolean;
  isSliding: boolean;
  bodyLean: number;
  trickJumpActive: boolean;
  trickJumpType: 'flip' | 'spin' | 'none';
  hasDoubleJumped: boolean;
}> = ({ position, isRunning, isSliding, bodyLean, trickJumpActive, trickJumpType, hasDoubleJumped }) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Sliding animation
    if (isSliding) {
      // Sliding pose: body horizontal, legs extended
      if (bodyRef.current) {
        bodyRef.current.rotation.x = Math.PI / 3; // 60 degrees forward lean
        bodyRef.current.position.y = -0.3; // Lower body position
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 6; // Legs extended
        rightLegRef.current.rotation.x = -Math.PI / 6;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI / 4; // Arms back for balance
        rightArmRef.current.rotation.x = -Math.PI / 4;
      }
    }
    // Trick Jump animations
    else if (trickJumpActive) {
      const trickTime = time * 6; // Fast trick animations
      
      if (trickJumpType === 'flip') {
        // Forward flip animation
        if (bodyRef.current) {
          bodyRef.current.rotation.x = trickTime % (Math.PI * 2);
        }
      } else if (trickJumpType === 'spin') {
        // Spinning animation
        if (groupRef.current) {
          groupRef.current.rotation.y = trickTime % (Math.PI * 2);
        }
      }
      
      // Add some flair with arms during tricks
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(trickTime) * 0.5;
        rightArmRef.current.rotation.x = -Math.sin(trickTime) * 0.5;
      }
    }
    // Normal running animation
    else if (isRunning) {
      // Reset positions and rotations
      if (bodyRef.current) {
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.x = 0.1; // Slight forward lean
      }
      if (groupRef.current) {
        groupRef.current.rotation.y = 0;
      }
      
      const runTime = time * 10;
      const armSwing = Math.sin(runTime) * 0.8;
      const legSwing = Math.sin(runTime) * 0.6;
      const bodyBob = Math.abs(Math.sin(runTime * 2)) * 0.08;
      
      // Enhanced running with double jump energy
      const energyMultiplier = hasDoubleJumped ? 1.5 : 1;
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing * energyMultiplier;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing * energyMultiplier;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -legSwing * energyMultiplier;
      if (rightLegRef.current) rightLegRef.current.rotation.x = legSwing * energyMultiplier;
      
      if (groupRef.current) {
        groupRef.current.position.y = position[1] + bodyBob;
      }
    }
    
    // Body lean for direction changes (always active)
    if (bodyRef.current && !isSliding && !trickJumpActive) {
      bodyRef.current.rotation.z = bodyLean * 0.3; // Lean sideways
    }
    
    // Double jump energy burst effect
    if (hasDoubleJumped && headRef.current) {
      const pulseTime = time * 8;
      const energyGlow = 0.5 + Math.sin(pulseTime) * 0.3;
      headRef.current.scale.setScalar(1 + energyGlow * 0.2);
    } else if (headRef.current) {
      headRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group ref={bodyRef}>
        {/* Head with energy effect */}
        <mesh ref={headRef} position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color={hasDoubleJumped ? "#ffeb3b" : "#ffdbac"} 
            emissive={hasDoubleJumped ? "#ffeb3b" : "#000000"}
            emissiveIntensity={hasDoubleJumped ? 0.3 : 0}
          />
        </mesh>
        
        {/* Torso */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.6, 0.25]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        
        {/* Arms */}
        <mesh ref={leftArmRef} position={[-0.3, 1.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        <mesh ref={rightArmRef} position={[0.3, 1.35, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* Legs */}
        <group ref={leftLegRef} position={[-0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <mesh position={[0, -0.65, 0.1]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
        
        <group ref={rightLegRef} position={[0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <mesh position={[0, -0.65, 0.1]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      </group>
      
      {/* Double Jump Energy Burst Effect */}
      {hasDoubleJumped && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent 
            opacity={0.3}
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

export const Player: React.FC = () => {
  const meshRef = useRef<Group>(null);
  const controls = usePlayerControls();
  const lastDirectionRef = useRef<'left' | 'right' | 'center'>('center');
  const slideEndTimeRef = useRef<number>(0);
  
  const {
    playerPosition,
    playerVelocity,
    isJumping,
    isPlaying,
    speedMultiplier,
    isSliding,
    canDoubleJump,
    hasDoubleJumped,
    trickJumpActive,
    trickJumpType,
    lastDirection,
    bodyLean,
    jumpStartTime,
    stylePoints,
    setPlayerPosition,
    setPlayerVelocity,
    setIsJumping,
    setIsSliding,
    setDirection,
    updateBodyLean,
    startJump,
    performDoubleJump,
    startTrickJump,
    endTrickJump,
    resetJumpState,
    addStylePoints,
    hasMagneticPull,
    setGameOver,
  } = useGameStore();

  // Magnetic pull effect for bonuses
  useEffect(() => {
    if (!hasMagneticPull() || !meshRef.current) return;

    const interval = setInterval(() => {
      // Find nearby bonuses and attract them
      // This would interact with the Bonus component
      const magnetEvent = new CustomEvent('magneticPull', {
        detail: {
          playerPosition: playerPosition,
          range: MAGNETIC_RANGE
        }
      });
      window.dispatchEvent(magnetEvent);
    }, 100);

    return () => clearInterval(interval);
  }, [hasMagneticPull, playerPosition]);

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying) return;

    const newPosition = { ...playerPosition };
    const newVelocity = { ...playerVelocity };
    const currentTime = Date.now();
    
    const currentForwardSpeed = BASE_FORWARD_SPEED * speedMultiplier;

    // === DIRECTION CHANGES WITH BODY LEAN ===
    const currentDirection = controls.moveLeft ? 'left' : controls.moveRight ? 'right' : 'center';
    
    if (currentDirection !== lastDirectionRef.current) {
      setDirection(currentDirection);
      lastDirectionRef.current = currentDirection;
    }

    // Update body lean based on movement direction
    const targetLean = currentDirection === 'left' ? -1 : currentDirection === 'right' ? 1 : 0;
    const leanDiff = targetLean - bodyLean;
    const newLean = bodyLean + leanDiff * LEAN_SPEED * delta;
    
    useGameStore.setState({ bodyLean: Math.max(-1, Math.min(1, newLean)) });

    // === SLIDING MECHANICS ===
    const slideInput = controls.slide; // We'll need to add this to controls
    
    if (slideInput && !isSliding && newPosition.y <= GROUND_Y + 0.1) {
      setIsSliding(true);
      slideEndTimeRef.current = currentTime + 1000; // 1 second slide
      newPosition.y = SLIDING_Y; // Lower player position
    }
    
    if (isSliding && currentTime > slideEndTimeRef.current) {
      setIsSliding(false);
      if (newPosition.y <= SLIDING_Y + 0.1) {
        newPosition.y = GROUND_Y; // Return to normal height
      }
    }

    // === HORIZONTAL MOVEMENT ===
    const moveSpeed = isSliding ? MOVEMENT_SPEED * 0.5 : MOVEMENT_SPEED; // Slower when sliding
    
    if (controls.moveLeft && newPosition.x < LANE_WIDTH) {
      newPosition.x += moveSpeed * delta;
    }
    if (controls.moveRight && newPosition.x > -LANE_WIDTH) {
      newPosition.x -= moveSpeed * delta;
    }

    // === JUMPING & DOUBLE JUMP ===
    const isGrounded = newPosition.y <= GROUND_Y + 0.1;
    const isSlidingHeight = newPosition.y <= SLIDING_Y + 0.1;
    
    if (controls.jump) {
      if (!isJumping && (isGrounded || (isSliding && isSlidingHeight))) {
        // First jump
        newVelocity.y = JUMP_FORCE;
        startJump();
        setIsSliding(false); // Exit slide when jumping
      } else if (isJumping && canDoubleJump && !hasDoubleJumped) {
        // Double jump
        newVelocity.y = DOUBLE_JUMP_FORCE;
        performDoubleJump();
        addStylePoints(5); // Style points for double jump
        
        // Add energy burst effect
        const burstEvent = new CustomEvent('doubleJumpBurst', {
          detail: { position: newPosition }
        });
        window.dispatchEvent(burstEvent);
      }
    }

    // === TRICK JUMPS ===
    const jumpDuration = (currentTime - jumpStartTime) / 1000;
    
    if (isJumping && jumpDuration > TRICK_JUMP_THRESHOLD && !trickJumpActive) {
      // Trigger trick jump based on movement
      if (controls.moveLeft && controls.moveRight) {
        // Both directions = spin
        startTrickJump('spin');
        addStylePoints(15);
      } else if (jumpDuration > 2) {
        // Long jump = flip
        startTrickJump('flip');
        addStylePoints(10);
      }
    }

    // === PHYSICS ===
    if (newPosition.y > GROUND_Y || newVelocity.y > 0) {
      newVelocity.y += GRAVITY * delta;
      newPosition.y += newVelocity.y * delta;
    }

    // Ground collision
    if (newPosition.y <= GROUND_Y && !isSliding) {
      newPosition.y = GROUND_Y;
      newVelocity.y = 0;
      resetJumpState();
      endTrickJump();
    } else if (newPosition.y <= SLIDING_Y && isSliding) {
      newPosition.y = SLIDING_Y;
      newVelocity.y = 0;
    }

    // Safety checks
    if (newPosition.y < GROUND_Y - 1) {
      newPosition.y = GROUND_Y;
      newVelocity.y = 0;
      resetJumpState();
    }

    // Forward movement
    newPosition.z += currentForwardSpeed * delta;

    // Update store and mesh
    setPlayerPosition(newPosition);
    setPlayerVelocity(newVelocity);

    if (meshRef.current) {
      meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
    }
  });

  return (
    <group ref={meshRef}>
      <RunningHuman 
        position={[0, 0, 0]} 
        isRunning={isPlaying}
        isSliding={isSliding}
        bodyLean={bodyLean}
        trickJumpActive={trickJumpActive}
        trickJumpType={trickJumpType}
        hasDoubleJumped={hasDoubleJumped}
      />
    </group>
  );
}; 