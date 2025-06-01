'use client';

import { useRef, useEffect } from 'react'; // Removed useMemo
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import * as THREE from 'three'; // Added import
import { useGameStore } from './store/useGameStore';
import { usePlayerControls } from './utils/usePlayerControls';
import { playSoundEffect, preloadSounds } from './utils/audioManager'; // Removed playMusic, stopMusic

const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 16; // <<<< MODIFIED: Increased jump force
const DOUBLE_JUMP_FORCE = 10; // <<<< MODIFIED: Also slightly increased double jump
const GRAVITY = -30; // <<<< MODIFIED: Slightly increased gravity
const GROUND_Y = 1;
const SLIDING_Y = 0.3; // Lower position when sliding
const LANE_WIDTH = 2;
const BASE_FORWARD_SPEED = 8;
const TRICK_JUMP_THRESHOLD = 1.5; // Jump duration for tricks
const MAGNETIC_RANGE = 3; // Range for magnetic pull
const LEAN_SPEED = 8; // How fast body leans during turns
const SLIDE_DURATION = 1000; // Added for consistency, used in Player logic

// Types
type TrickJumpType = 'flip' | 'spin' | 'none';

// Enhanced Human character component with all abilities (Restored)
const RunningHuman: React.FC<{ 
  position: [number, number, number]; 
  isRunning: boolean;
  isSliding: boolean;
  bodyLean: number;
  trickJumpActive: boolean;
  trickJumpType: TrickJumpType; // Corrected type usage
  hasDoubleJumped: boolean;
}> = ({ position, isRunning, isSliding, bodyLean, trickJumpActive, trickJumpType, hasDoubleJumped }) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => { // Added delta
    if (!groupRef.current || !bodyRef.current || !leftArmRef.current || !rightArmRef.current || !leftLegRef.current || !rightLegRef.current || !headRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Sliding animation - optimized
    if (isSliding) {
      bodyRef.current.rotation.x = Math.PI / 3;
      bodyRef.current.position.y = -0.3;
      leftLegRef.current.rotation.x = -Math.PI / 6;
      rightLegRef.current.rotation.x = -Math.PI / 6;
      leftArmRef.current.rotation.x = -Math.PI / 4;
      rightArmRef.current.rotation.x = -Math.PI / 4;
    }
    // Trick Jump animations - optimized
    else if (trickJumpActive) {
      const trickTime = (time * 6) % (Math.PI * 2); 
      
      if (trickJumpType === 'flip') {
        bodyRef.current.rotation.x = trickTime;
      } else if (trickJumpType === 'spin') {
        groupRef.current.rotation.y = trickTime;
      }
      
      const armRotation = Math.sin(trickTime) * 0.5;
      leftArmRef.current.rotation.x = armRotation;
      rightArmRef.current.rotation.x = -armRotation;
    }
    // Normal running animation - optimized
    else if (isRunning) {
      bodyRef.current.position.y = 0;
      bodyRef.current.rotation.x = 0.1; // Slight forward lean
      groupRef.current.rotation.y = 0; // Reset spin from tricks
      
      const runTime = time * 10;
      const armSwing = Math.sin(runTime) * 0.8;
      const legSwing = Math.sin(runTime) * 0.6;
      const bodyBob = Math.abs(Math.sin(runTime * 0.5)) * 0.05; // Slower, more subtle bob
      
      const energyMultiplier = hasDoubleJumped ? 1.5 : 1;
      
      leftArmRef.current.rotation.x = armSwing * energyMultiplier;
      rightArmRef.current.rotation.x = -armSwing * energyMultiplier;
      leftLegRef.current.rotation.x = -legSwing * energyMultiplier;
      rightLegRef.current.rotation.x = legSwing * energyMultiplier;
      
      // Apply bodyBob to the main group so the whole character bobs
      // The 'position' prop for RunningHuman is [0,0,0] as it's relative to the Player group.
      // The actual y position of the player is handled by the Player component's meshRef.
      // So, we adjust the groupRef's y position for bobbing.
      groupRef.current.position.y = bodyBob;
    } else { // Idle or not running
        bodyRef.current.position.y = 0;
        bodyRef.current.rotation.x = 0;
        groupRef.current.rotation.y = 0;
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
        groupRef.current.position.y = 0; // Reset bob
    }
    
    // Body lean for direction changes - optimized
    if (!isSliding && !trickJumpActive) { // Only lean if not sliding or tricking
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, bodyLean * 0.3, delta * LEAN_SPEED);
    } else {
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * LEAN_SPEED); // Straighten up if sliding/tricking
    }
    
    // Double jump energy burst effect - optimized
    if (hasDoubleJumped) {
      const pulseTime = time * 8;
      const energyScale = 1 + Math.sin(pulseTime) * 0.2;
      headRef.current.scale.setScalar(energyScale);
      (headRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xffff00);
      (headRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.abs(Math.sin(pulseTime * 0.5));
    } else {
      headRef.current.scale.setScalar(1);
      (headRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      (headRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  });

  return (
    <group ref={groupRef} position={position}> {/* position prop is [0,0,0] here */}
      <group ref={bodyRef}>
        <mesh ref={headRef} position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={"#ffdbac"} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.6, 0.25]} />
          <meshStandardMaterial color={"#4f46e5"} roughness={0.2} metalness={0.6} emissive={"#4f46e5"} emissiveIntensity={0.2} />
        </mesh>
        <mesh ref={leftArmRef} position={[-0.3, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
          <meshStandardMaterial color={"#ffdbac"} roughness={0.3} metalness={0.1} emissive={"#ffdbac"} emissiveIntensity={0.1} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.3, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
          <meshStandardMaterial color={"#ffdbac"} roughness={0.3} metalness={0.1} emissive={"#ffdbac"} emissiveIntensity={0.1} />
        </mesh>
        <group ref={leftLegRef} position={[-0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
            <meshStandardMaterial color={"#2563eb"} roughness={0.2} metalness={0.5} emissive={"#2563eb"} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, -0.65, 0.1]} castShadow> {/* Feet */}
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color={"#1f2937"} roughness={0.2} metalness={0.7} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
            <meshStandardMaterial color={"#2563eb"} roughness={0.2} metalness={0.5} emissive={"#2563eb"} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, -0.65, 0.1]} castShadow> {/* Feet */}
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color={"#1f2937"} roughness={0.2} metalness={0.7} />
          </mesh>
        </group>
      </group>
      {hasDoubleJumped && (
        <>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color="#00ffff" transparent opacity={0.3} emissive="#00ffff" emissiveIntensity={1.0} roughness={0.0} metalness={1.0}/>
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 1;
            return (
              <mesh key={i} position={[ Math.cos(angle) * radius, 1, Math.sin(angle) * radius ]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#00ffff" transparent opacity={0.2} emissive="#00ffff" emissiveIntensity={1.0} roughness={0.0} metalness={1.0} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

export const Player: React.FC = () => {
  const meshRef = useRef<Group>(null!); // Ensure non-null assertion if confident
  const controls = usePlayerControls();
  // const lastDirectionRef = useRef<'left' | 'right' | 'center'>('center'); // Removed unused ref
  const slideEndTimeRef = useRef<number>(0);
  
  const {
    playerPosition, playerVelocity, isJumping, isPlaying, speedMultiplier,
    isSliding, canDoubleJump, hasDoubleJumped, trickJumpActive, trickJumpType,
    lastDirection, bodyLean, jumpStartTime, // Removed stylePoints
    isGameOver, 
    setPlayerPosition, setPlayerVelocity, setIsSliding, // Removed setIsJumping
    setDirection, // Removed updateBodyLean
    startJump, performDoubleJump, startTrickJump, endTrickJump, resetJumpState,
    // Removed addStylePoints
    hasMagneticPull, incrementScore // Removed setGameOver, activateBonus
  } = useGameStore();

  useEffect(() => {
    preloadSounds(); // Ensure sounds are loaded when player component mounts
  }, []); // Empty dependency array, runs once on mount

  // Music control is now handled by useGameStore actions (startGame, setGameOver, resetGame)

  useEffect(() => {
    if (isGameOver) playSoundEffect('gameOver'); // isGameOver is now defined
  }, [isGameOver]); // isGameOver is now defined

  useFrame((state, delta) => {
    if (!meshRef.current || !isPlaying) return;

    const newPosition = { ...playerPosition };
    // eslint-disable-next-line prefer-const
    let newVelocity = { ...playerVelocity };
    const currentTime = Date.now();
    const storeState = useGameStore.getState(); // Get current store state for checks like hasJumpBoost
    
    const currentForwardSpeed = BASE_FORWARD_SPEED * speedMultiplier * (storeState.bonusEffects.slowMotion > 0 ? 0.5 : 1);


    // === DIRECTION CHANGES WITH BODY LEAN ===
    // Using controls.moveLeft and controls.moveRight as per usePlayerControls.ts
    const targetDirection = controls.moveLeft ? 'left' : controls.moveRight ? 'right' : 'center';
    if (targetDirection !== lastDirection) { // Use lastDirection from store
      setDirection(targetDirection); // Update store
    }
    // Body lean is updated via store's updateBodyLean or directly if preferred
    // For simplicity, we pass bodyLean prop to RunningHuman which handles its own lerp.
    // The store's bodyLean is the target.
    // If left control means move screen-left, and that's positive X, then lean should be positive.
    const targetLeanValue = targetDirection === 'left' ? -1 : targetDirection === 'right' ? 1 : 0; // Corrected lean direction
    // Smoothly update bodyLean in the store if not using updateBodyLean action
    useGameStore.setState({ bodyLean: THREE.MathUtils.lerp(bodyLean, targetLeanValue, delta * LEAN_SPEED) });


    // === SLIDING MECHANICS ===
    if (controls.slide && !isSliding && newPosition.y <= GROUND_Y + 0.1) {
      setIsSliding(true);
      playSoundEffect('slide');
      slideEndTimeRef.current = currentTime + SLIDE_DURATION;
      // newPosition.y = SLIDING_Y; // Visuals handled by RunningHuman, physics might not need this if collision box changes
    }
    
    if (isSliding && currentTime > slideEndTimeRef.current) {
      setIsSliding(false);
      // if (newPosition.y <= SLIDING_Y + 0.1) { // Ensure player returns to ground if somehow stuck
      //   newPosition.y = GROUND_Y;
      // }
    }
    if(isSliding) newPosition.y = SLIDING_Y; // Ensure player is at sliding height if isSliding is true

    // === HORIZONTAL MOVEMENT ===
    const moveSpeed = isSliding ? MOVEMENT_SPEED * 0.7 : MOVEMENT_SPEED; // Slightly less reduction
    
    if (controls.moveLeft) { 
      newPosition.x += moveSpeed * delta; // Corrected: moveLeft increases X
    }
    if (controls.moveRight) { 
      newPosition.x -= moveSpeed * delta; // Corrected: moveRight decreases X
    }
    // Clamp position
    newPosition.x = Math.max(-LANE_WIDTH, Math.min(LANE_WIDTH, newPosition.x));


    // === JUMPING & DOUBLE JUMP ===
    const isGrounded = newPosition.y <= GROUND_Y + 0.01; // More precise ground check
    
    if (controls.jump) {
      if (!isJumping && isGrounded) {
        newVelocity.y = JUMP_FORCE * (storeState.hasJumpBoost() ? 1.5 : 1);
        startJump();
        setIsSliding(false); 
        playSoundEffect('jump');
      } else if (isJumping && canDoubleJump && !hasDoubleJumped) {
        newVelocity.y = DOUBLE_JUMP_FORCE * (storeState.hasJumpBoost() ? 1.5 : 1);
        performDoubleJump();
        // addStylePoints(5); // Style points for double jump - already in store action?
        playSoundEffect('doubleJump');
      }
    }

    // === TRICK JUMPS ===
    const jumpDuration = (currentTime - jumpStartTime) / 1000;
    if (isJumping && !hasDoubleJumped && jumpDuration > TRICK_JUMP_THRESHOLD && !trickJumpActive) {
      if (controls.moveLeft && controls.moveRight) { // Example: Both for spin
        startTrickJump('spin');
        // addStylePoints(15);
      } else if (jumpDuration > 1.8) { // Longer hold for flip
        startTrickJump('flip');
        // addStylePoints(10);
      }
    }


    // === PHYSICS ===
    if (newPosition.y > GROUND_Y || newVelocity.y > 0 || isJumping) { // Apply gravity if in air
      newVelocity.y += GRAVITY * delta;
      newPosition.y += newVelocity.y * delta;
    }

    // Ground collision
    if (newPosition.y <= GROUND_Y && !isSliding) {
      newPosition.y = GROUND_Y;
      newVelocity.y = 0;
      if(isJumping) resetJumpState(); // Reset jump state only if was jumping
      if(trickJumpActive) endTrickJump();
    } else if (newPosition.y <= SLIDING_Y && isSliding) {
      newPosition.y = SLIDING_Y;
      newVelocity.y = 0;
      if(isJumping) resetJumpState(); // Also reset if landing into a slide
      if(trickJumpActive) endTrickJump();
    }
    
    // Safety net
    if (newPosition.y < (isSliding ? SLIDING_Y : GROUND_Y) - 0.5) { // If fallen through significantly
        newPosition.y = isSliding ? SLIDING_Y : GROUND_Y;
        newVelocity.y = 0;
        if(isJumping) resetJumpState();
        if(trickJumpActive) endTrickJump();
    }


    // Forward movement (world moves, player's Z position in its own group is 0)
    // The player's group (meshRef) moves forward in world space.
    newPosition.z += currentForwardSpeed * delta;


    setPlayerPosition(newPosition);
    setPlayerVelocity(newVelocity);

    meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);


    // Handle magnetic pull
    if (hasMagneticPull()) {
      const collectibles = state.scene.children.filter(child => 
        child.userData.type === 'collectible' && 
        meshRef.current && 
        child.position.distanceTo(meshRef.current.position) < MAGNETIC_RANGE 
      );
      collectibles.forEach(collectible => {
        if (meshRef.current) { 
          const direction = new Vector3().subVectors(meshRef.current.position, collectible.position).normalize();
          collectible.position.add(direction.multiplyScalar(10 * delta));
          if (collectible.position.distanceTo(meshRef.current.position) < 1) {
            playSoundEffect('coinCollect'); 
            incrementScore(); // Use incrementScore from store
            collectible.visible = false;
            setTimeout(() => { state.scene.remove(collectible);}, 100);
          }
        }
      });
    }
  });

  return (
    <group ref={meshRef} position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      <RunningHuman 
        position={[0, 0, 0]} // RunningHuman is relative to this group
        isRunning={isPlaying && !isJumping && !isSliding}
        isSliding={isSliding}
        bodyLean={bodyLean} // Pass bodyLean from store
        trickJumpActive={trickJumpActive}
        trickJumpType={trickJumpType}
        hasDoubleJumped={hasDoubleJumped}
      />
    </group>
  );
};
