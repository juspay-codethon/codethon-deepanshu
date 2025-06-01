'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, PerspectiveCamera, MathUtils } from 'three';
import { useGameStore } from './store/useGameStore';

export const Camera: React.FC = () => {
  const { camera } = useThree();
  const { 
    playerPosition, 
    isPlaying, 
    speedMultiplier, 
    bonusEffects, 
    isSliding, 
    trickJumpActive,
    bodyLean 
  } = useGameStore();
  
  const targetPosition = useRef(new Vector3());
  const currentPosition = useRef(new Vector3(0, 2.5, -3.5)); // Closer initial position
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  
  // Camera shake variables
  const shakeIntensity = useRef(0);
  const shakeOffset = useRef(new Vector3());

  useEffect(() => {
    // Set initial camera position and properties
    camera.position.copy(currentPosition.current);
    (camera as PerspectiveCamera).fov = 75; // Reduced FOV for less distortion
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => { // Removed state and delta as they are not used
    if (!isPlaying) return;

    // Calculate dynamic camera offset based on speed and character state
    const speedFactor = Math.min(speedMultiplier, 2.5);
    
    // Enhanced base offset for closer, more dynamic view
    const baseOffset = new Vector3(0, 2.2, -3.2); // Much closer to character
    
    // Adjust camera based on character state
    let stateOffsetY = 0;
    let stateOffsetZ = 0;
    
    if (isSliding) {
      stateOffsetY -= 0.6; // Lower camera when sliding
      stateOffsetZ += 0.3; // Move slightly closer
    }
    
    if (trickJumpActive) {
      stateOffsetY += 0.8; // Higher camera for trick jumps
      stateOffsetZ -= 0.5; // Pull back for better trick view
    }

    // Dynamic offset with speed-based adjustments
    const dynamicOffset = baseOffset.clone();
    dynamicOffset.z -= speedFactor * 0.8; // Less pullback for closer view
    dynamicOffset.y += speedFactor * 0.2 + stateOffsetY;
    dynamicOffset.z += stateOffsetZ;

    // Enhanced lateral following based on body lean
    const leanOffset = bodyLean * 0.8; // More responsive lateral movement

    // Target position follows player with enhanced tracking
    targetPosition.current.set(
      playerPosition.x * 0.4 + leanOffset, // Enhanced lateral following with lean
      playerPosition.y + dynamicOffset.y,
      playerPosition.z + dynamicOffset.z
    );

    // Enhanced look-at targeting
    const lookAheadDistance = 3 + speedFactor * 1.5; // Closer look-ahead
    const lookAtHeight = playerPosition.y + 0.8; // Look at character's upper body
    
    targetLookAt.current.set(
      playerPosition.x + bodyLean * 0.5, // Follow lean direction
      lookAtHeight + (isSliding ? -0.5 : 0), // Lower when sliding
      playerPosition.z + lookAheadDistance
    );

    // Enhanced smooth camera movement
    const positionDamping = 0.08; // Slightly more responsive
    const lookAtDamping = 0.12; // More responsive look-at
    
    currentPosition.current.lerp(targetPosition.current, positionDamping);
    currentLookAt.current.lerp(targetLookAt.current, lookAtDamping);

    // Enhanced screen shake system
    let shakeIntensityTarget = 0;
    
    if (bonusEffects.speedBoost > 0) {
      shakeIntensityTarget = Math.min(0.15, bonusEffects.speedBoost * 0.03);
    }
    
    if (trickJumpActive) {
      shakeIntensityTarget = Math.max(shakeIntensityTarget, 0.1);
    }
    
    if (isSliding) {
      shakeIntensityTarget = Math.max(shakeIntensityTarget, 0.05);
    }

    // Smooth shake transition
    shakeIntensity.current = MathUtils.lerp(shakeIntensity.current, shakeIntensityTarget, 0.1);

    // Generate screen shake offset
    if (shakeIntensity.current > 0.01) {
      shakeOffset.current.set(
        (Math.random() - 0.5) * shakeIntensity.current,
        (Math.random() - 0.5) * shakeIntensity.current,
        (Math.random() - 0.5) * shakeIntensity.current * 0.3
      );
    } else {
      shakeOffset.current.set(0, 0, 0);
    }

    // Apply position with shake
    camera.position.copy(currentPosition.current).add(shakeOffset.current);
    
    // Look at target
    camera.lookAt(currentLookAt.current);

    // Enhanced dynamic FOV system
    const baseFOV = 75; // Higher base FOV for closer view
    let dynamicFOV = baseFOV;
    
    // Speed-based FOV
    dynamicFOV += speedMultiplier * 6;
    
    // State-based FOV adjustments
    if (bonusEffects.speedBoost > 0) {
      dynamicFOV += 8; // More dramatic speed boost effect
    }
    
    if (trickJumpActive) {
      dynamicFOV += 5; // Wider view for tricks
    }
    
    if (isSliding) {
      dynamicFOV -= 5; // Slightly narrower for focus during slides
    }
    
    // Clamp FOV to reasonable range
    dynamicFOV = Math.max(70, Math.min(110, dynamicFOV));
    
    (camera as PerspectiveCamera).fov = dynamicFOV;
    camera.updateProjectionMatrix();
  });

  return null;
};
