'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Vector3, Color } from 'three'; // Removed PointsMaterial, BufferGeometry
import { useGameStore } from './store/useGameStore';

interface Particle {
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: Color;
  type: 'dust' | 'collection' | 'speed' | 'trail' | 'doubleJump' | 'slide' | 'trick' | 'magnetic';
}

export const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { 
    playerPosition, 
    isPlaying, 
    bonusEffects, 
    speedMultiplier,
    isSliding,
    trickJumpActive,
    // hasDoubleJumped, // Removed as it's not directly used for particle emission logic here
    hasMagneticPull 
  } = useGameStore();

  // Create particle system
  const particleCount = 300; // Increased for more effects
  const positions = useMemo(() => new Float32Array(particleCount * 3), []);
  const colors = useMemo(() => new Float32Array(particleCount * 3), []);
  const sizes = useMemo(() => new Float32Array(particleCount), []);

  // Initialize particles
  useMemo(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      position: new Vector3(0, -100, 0), // Start off-screen
      velocity: new Vector3(0, 0, 0),
      life: 0,
      maxLife: 1,
      size: 0,
      color: new Color(1, 1, 1),
      type: 'dust' as const
    }));
  }, []);

  // Listen for double jump burst event
  useEffect(() => {
    const handleDoubleJumpBurst = (event: CustomEvent) => {
      const { position } = event.detail;
      createDoubleJumpBurst(new Vector3(position.x, position.y, position.z));
    };

    window.addEventListener('doubleJumpBurst', handleDoubleJumpBurst as EventListener);
    
    return () => {
      window.removeEventListener('doubleJumpBurst', handleDoubleJumpBurst as EventListener);
    };
  }, []);

  const createDustParticle = (index: number) => {
    const particle = particlesRef.current[index];
    particle.position.set(
      playerPosition.x + (Math.random() - 0.5) * 4,
      0.1 + Math.random() * 0.5,
      playerPosition.z - 2 + Math.random() * 2
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 2,
      Math.random() * 3 + 1,
      -speedMultiplier * 8 - Math.random() * 4
    );
    particle.life = 1;
    particle.maxLife = 1 + Math.random() * 2;
    particle.size = 0.3 + Math.random() * 0.5;
    particle.color.setHSL(0.1, 0.3, 0.6 + Math.random() * 0.4); // Dusty brown/tan
    particle.type = 'dust';
  };

  const createSlidingParticle = (index: number) => {
    const particle = particlesRef.current[index];
    particle.position.set(
      playerPosition.x + (Math.random() - 0.5) * 6,
      0.05 + Math.random() * 0.3,
      playerPosition.z - 3 + Math.random() * 4
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 8,
      Math.random() * 2 + 0.5,
      -speedMultiplier * 12 - Math.random() * 8
    );
    particle.life = 1;
    particle.maxLife = 0.8 + Math.random() * 0.4;
    particle.size = 0.4 + Math.random() * 0.6;
    particle.color.setHSL(0.1, 0.6, 0.4 + Math.random() * 0.3); // More intense dust for sliding
    particle.type = 'slide';
  };

  // Removed unused createCollectionParticle function

  const createSpeedParticle = (index: number) => {
    const particle = particlesRef.current[index];
    particle.position.set(
      playerPosition.x + (Math.random() - 0.5) * 2,
      playerPosition.y + Math.random() * 2,
      playerPosition.z - 1 - Math.random() * 3
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 4,
      Math.random() * 2,
      -speedMultiplier * 12 - Math.random() * 8
    );
    particle.life = 1;
    particle.maxLife = 0.8 + Math.random() * 0.4;
    particle.size = 0.2 + Math.random() * 0.3;
    particle.color.setHSL(0.08, 1, 0.7); // Orange speed trails
    particle.type = 'speed';
  };

  const createDoubleJumpBurst = (position: Vector3) => {
    const inactiveParticles = particlesRef.current.filter(p => p.life <= 0);
    const burstCount = Math.min(20, inactiveParticles.length);
    
    for (let i = 0; i < burstCount; i++) {
      const index = particlesRef.current.indexOf(inactiveParticles[i]);
      const particle = particlesRef.current[index];
      
      const angle = (i / burstCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      
      particle.position.copy(position);
      particle.velocity.set(
        Math.cos(angle) * radius,
        Math.random() * 8 + 4,
        Math.sin(angle) * radius
      );
      particle.life = 1;
      particle.maxLife = 1.2 + Math.random() * 0.8;
      particle.size = 0.6 + Math.random() * 0.8;
      particle.color.setHSL(0.5, 1, 0.8 + Math.random() * 0.2); // Cyan energy burst
      particle.type = 'doubleJump';
    }
  };

  const createTrickParticle = (index: number) => {
    const particle = particlesRef.current[index];
    particle.position.set(
      playerPosition.x + (Math.random() - 0.5) * 3,
      playerPosition.y + Math.random() * 2,
      playerPosition.z + (Math.random() - 0.5) * 3
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 4 + 2,
      (Math.random() - 0.5) * 6
    );
    particle.life = 1;
    particle.maxLife = 1.5 + Math.random() * 1;
    particle.size = 0.3 + Math.random() * 0.5;
    particle.color.setHSL(0.75, 1, 0.7 + Math.random() * 0.3); // Purple sparkles for tricks
    particle.type = 'trick';
  };

  const createMagneticParticle = (index: number) => {
    const particle = particlesRef.current[index];
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    
    particle.position.set(
      playerPosition.x + Math.cos(angle) * radius,
      playerPosition.y + Math.random() * 2 + 0.5,
      playerPosition.z + Math.sin(angle) * radius
    );
    particle.velocity.set(
      -Math.cos(angle) * 2, // Swirl inward
      Math.sin(Date.now() * 0.01) * 2,
      -Math.sin(angle) * 2
    );
    particle.life = 1;
    particle.maxLife = 2 + Math.random() * 1;
    particle.size = 0.2 + Math.random() * 0.3;
    particle.color.setHSL(0.9, 1, 0.6 + Math.random() * 0.4); // Pink magnetic field
    particle.type = 'magnetic';
  };

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // let activeParticles = 0; // Removed unused variable

    // Update existing particles
    particlesRef.current.forEach((particle, index) => {
      if (particle.life > 0) {
        // Update physics based on particle type
        if (particle.type === 'magnetic') {
          // Spiral motion for magnetic particles
          const time = state.clock.elapsedTime;
          const spiralRadius = 2 * particle.life;
          particle.position.x = playerPosition.x + Math.cos(time * 2 + index) * spiralRadius;
          particle.position.z = playerPosition.z + Math.sin(time * 2 + index) * spiralRadius;
          particle.position.y += Math.sin(time * 3 + index) * delta;
        } else {
          // Normal physics for other particles
          particle.position.add(particle.velocity.clone().multiplyScalar(delta));
          particle.velocity.y -= 9.8 * delta; // Gravity
          particle.velocity.multiplyScalar(particle.type === 'doubleJump' ? 0.95 : 0.98); // Less resistance for energy bursts
        }
        
        // Update life
        particle.life -= delta / particle.maxLife;
        
        if (particle.life > 0) {
          // Update position buffer
          positions[index * 3] = particle.position.x;
          positions[index * 3 + 1] = particle.position.y;
          positions[index * 3 + 2] = particle.position.z;
          
          // Update color buffer with life-based alpha and type-specific effects
          let alpha = Math.max(0, particle.life);
          if (particle.type === 'doubleJump' || particle.type === 'trick') {
            alpha *= (0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5); // Pulsing effect
          }
          
          colors[index * 3] = particle.color.r * alpha;
          colors[index * 3 + 1] = particle.color.g * alpha;
          colors[index * 3 + 2] = particle.color.b * alpha;
          
          // Update size buffer
          let size = particle.size * alpha;
          if (particle.type === 'doubleJump') {
            size *= (1 + Math.sin(state.clock.elapsedTime * 8) * 0.3); // Pulsing size
          }
          sizes[index] = size;
          
          // activeParticles++; // Removed unused increment
        } else {
          // Hide dead particle
          positions[index * 3 + 1] = -100;
          sizes[index] = 0;
        }
      }
    });

    // Spawn new particles
    const inactiveParticles = particlesRef.current.filter(p => p.life <= 0);
    
    if (inactiveParticles.length > 0) {
      // Sliding particles (more intense dust)
      if (isSliding && Math.random() < 0.8) {
        const index = particlesRef.current.indexOf(inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)]);
        createSlidingParticle(index);
      }
      // Regular dust particles when moving
      else if (!isSliding && Math.random() < 0.3) {
        const index = particlesRef.current.indexOf(inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)]);
        createDustParticle(index);
      }
      
      // Speed boost particles
      if (bonusEffects.speedBoost > 0 && inactiveParticles.length > 2 && Math.random() < 0.6) {
        const index = particlesRef.current.indexOf(inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)]);
        createSpeedParticle(index);
      }
      
      // Trick jump sparkles
      if (trickJumpActive && inactiveParticles.length > 5 && Math.random() < 0.9) {
        const index = particlesRef.current.indexOf(inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)]);
        createTrickParticle(index);
      }
      
      // Magnetic field particles
      if (hasMagneticPull() && inactiveParticles.length > 3 && Math.random() < 0.4) {
        const index = particlesRef.current.indexOf(inactiveParticles[Math.floor(Math.random() * inactiveParticles.length)]);
        createMagneticParticle(index);
      }
    }

    // Update geometry
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </points>
  );
};
