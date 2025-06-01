'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, Group, BackSide } from 'three';
import * as THREE from 'three';
import { useGameStore } from './store/useGameStore';

// Enhanced sky theme with dynamic colors
const SKY_THEME = {
  top: '#1e40af',    // Deep blue
  middle: '#3b82f6', // Bright blue
  bottom: '#93c5fd', // Light blue
  clouds: '#ffffff',  // Pure white
  sunGlow: '#fef3c7', // Warm glow
  sunCore: '#fef9c3'  // Bright sun core
};

const Cloud: React.FC<{ position: [number, number, number]; scale: number; cloudId: number }> = ({ 
  position, 
  scale,
  cloudId 
}) => {
  const cloudRef = useRef<Mesh>(null);
  const { isPlaying } = useGameStore();
  
  useFrame((state) => {
    if (!cloudRef.current) return;
    
    const time = state.clock.elapsedTime;
    const offset = cloudId * 0.1;
    
    // Gentle floating motion
    cloudRef.current.position.y = position[1] + Math.sin(time * 0.2 + offset) * 0.5;
    cloudRef.current.position.x = position[0] + Math.sin(time * 0.1 + offset) * 0.3;
    
    // Subtle rotation
    cloudRef.current.rotation.y = Math.sin(time * 0.1 + offset) * 0.1;
    cloudRef.current.rotation.x = Math.sin(time * 0.15 + offset) * 0.05;
  });

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {/* Main cloud body */}
      <mesh castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={SKY_THEME.clouds} 
          roughness={1}
          metalness={0}
          emissive={SKY_THEME.clouds}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Cloud details */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.8;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 0.2,
              Math.sin(angle) * radius
            ]}
            scale={0.7}
            castShadow
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial 
              color={SKY_THEME.clouds} 
              roughness={1}
              metalness={0}
              emissive={SKY_THEME.clouds}
              emissiveIntensity={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const Sky: React.FC = () => {
  const groupRef = useRef<Group>(null);
  
  // Generate more varied cloud positions
  const clouds = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const radius = 40 + Math.random() * 20;
      const angle = (i / 20) * Math.PI * 2;
      return {
        id: i,
        position: [
          Math.cos(angle) * radius,
          25 + Math.random() * 10,
          Math.sin(angle) * radius
        ] as [number, number, number],
        scale: 2 + Math.random() * 2
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Sky dome */}
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <sphereGeometry args={[200, 32, 32]} />
        <meshStandardMaterial 
          color={SKY_THEME.middle}
          side={BackSide}
          fog={false}
          metalness={0}
          roughness={1}
          vertexColors
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `
              varying vec3 vWorldPosition;
              void main() {
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              `
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              'void main() {',
              `
              varying vec3 vWorldPosition;
              uniform vec3 topColor;
              uniform vec3 bottomColor;
              void main() {
                float h = normalize(vWorldPosition).y;
                vec3 skyColor = mix(bottomColor, topColor, max(0.0, h));
              `
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <color_fragment>',
              'diffuseColor.rgb = skyColor;'
            );
            
            Object.assign(shader.uniforms, {
              topColor: { value: new THREE.Color(SKY_THEME.top) },
              bottomColor: { value: new THREE.Color(SKY_THEME.bottom) }
            });
          }}
        />
      </mesh>

      {/* Enhanced sun with glow */}
      <group position={[40, 30, -50]}>
        {/* Sun core */}
        <mesh renderOrder={1}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial 
            color={SKY_THEME.sunCore}
            fog={false}
          />
        </mesh>
        
        {/* Sun glow */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial 
            color={SKY_THEME.sunGlow}
            transparent
            opacity={0.4}
            fog={false}
          />
        </mesh>
        
        {/* Sun rays */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh 
              key={i}
              position={[
                Math.cos(angle) * 8,
                Math.sin(angle) * 8,
                0
              ]}
              renderOrder={0}
            >
              <sphereGeometry args={[2, 16, 16]} />
              <meshBasicMaterial 
                color={SKY_THEME.sunGlow}
                transparent
                opacity={0.2}
                fog={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* Animated Clouds */}
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          position={cloud.position}
          scale={cloud.scale}
          cloudId={cloud.id}
        />
      ))}
    </group>
  );
}; 