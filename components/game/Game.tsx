'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField, 
  Vignette,
  SMAA,
  ToneMapping
} from '@react-three/postprocessing';
import { Environment as DreiEnvironment } from '@react-three/drei';

import { Player } from './Player';
import { Ground } from './Ground';
import { Obstacle } from './Obstacle';
import { Bonus } from './Bonus';
import { Environment } from './Environment';
import { Sky } from './Sky';
import { Camera } from './Camera';
import { HUD } from './HUD';
import { ParticleSystem } from './ParticleSystem';

export const Game: React.FC = () => {
  return (
    <div className="w-full h-screen relative">
      <Canvas 
        shadows 
        camera={{
          position: [0, 3, -5],
          fov: 85,
          near: 0.1,
          far: 300 // Increased far plane to accommodate sky dome
        }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true // Better depth precision
        }}
        dpr={[1, 2]} // Adaptive pixel ratio for performance
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting System */}
          <ambientLight intensity={0.4} color="#87ceeb" />
          
          {/* Main directional light (sun) */}
          <directionalLight
            position={[50, 50, 25]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={200}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-bias={-0.0001}
            color="#ffeaa7"
          />
          
          {/* Fill light for softer shadows */}
          <directionalLight
            position={[-20, 20, 10]}
            intensity={0.3}
            color="#87ceeb"
          />
          
          {/* Rim lighting for depth */}
          <directionalLight
            position={[0, 10, -30]}
            intensity={0.4}
            color="#ffffff"
          />

          {/* Atmospheric fog for depth */}
          {/* <Fog attach="fog" args={['#87ceeb', 50, 200]} /> */}
          
          {/* HDRI Environment for realistic reflections */}
          <DreiEnvironment preset="dawn" background={false} />

          {/* Game Components */}
          <Player />
          <Ground />
          <Obstacle />
          <Bonus />
          <Environment />
          <Sky />
          <ParticleSystem />
          <Camera />
          
          {/* Post-Processing Effects */}
          <EffectComposer>
            {/* Anti-aliasing for smooth edges */}
            <SMAA />
            
            {/* Bloom for glowing effects */}
            <Bloom 
              intensity={0.3}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
              height={300}
              opacity={1}
            />
            
            {/* Depth of field for focus effect */}
            <DepthOfField 
              focusDistance={0.02}
              focalLength={0.025}
              bokehScale={3}
            />
            
            {/* Vignette for cinematic look */}
            <Vignette 
              eskil={false}
              offset={0.1}
              darkness={0.5}
            />
            
            {/* Tone mapping for realistic lighting */}
            <ToneMapping 
              adaptive={true}
              resolution={256}
              middleGrey={0.6}
              maxLuminance={16}
              averageLuminance={1}
              adaptationRate={1}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      {/* Enhanced UI Overlay */}
      <HUD />
    </div>
  );
}; 