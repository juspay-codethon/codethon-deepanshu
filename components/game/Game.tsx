'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { 
  EffectComposer, 
  Bloom, 
  // DepthOfField, // Removed unused import
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
import { Loader } from '../ui/Loader'; // Import the Loader

export const Game: React.FC = () => {
  return (
    <div className="w-full h-screen relative">
      <Canvas 
        shadows 
        camera={{
          position: [0, 2.5, -3.5],
          fov: 75,
          near: 0.1,
          far: 2000 // Increased far plane
        }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true, // Re-enabled for better depth precision
        }}
        dpr={[1, 1.5]} // Reduced max DPR for performance
      >
        <Suspense fallback={<Loader message="Loading Game Assets..." />}>
          {/* Optimized Lighting System */}
          <ambientLight intensity={0.3} color="#b4d4ff" />
          
          {/* Main directional light (sun) - optimized shadows */}
          <directionalLight
            position={[50, 50, 25]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]} // Reduced for performance
            shadow-camera-far={300} // Increased shadow camera far slightly
            shadow-camera-left={-50} // Expanded shadow camera frustum
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-bias={-0.0001}
            color="#ffeaa7"
          />
          
          {/* Fill light for softer shadows */}
          <directionalLight
            position={[-20, 20, 10]}
            intensity={0.4}
            color="#b4d4ff"
          />
          
          {/* Rim lighting for depth */}
          <directionalLight
            position={[0, 10, -30]}
            intensity={0.5}
            color="#ffffff"
          />

          {/* Atmospheric fog for depth - adjusted distances */}
          <fog attach="fog" args={['#b4d4ff', 100, 1000]} /> 
          
          {/* HDRI Environment for realistic reflections */}
          <DreiEnvironment preset="sunset" background={false} />

          {/* Game Components */}
          <Player />
          <Ground />
          <Obstacle />
          <Bonus />
          <Environment />
          <Sky />
          <ParticleSystem />
          <Camera />
          
          {/* Optimized Post-Processing Effects */}
          <EffectComposer multisampling={2}>
            <SMAA />
            <Bloom 
              intensity={0.4}
              luminanceThreshold={0.7}
              luminanceSmoothing={0.9}
              height={200}
              opacity={0.8}
            />
            <Vignette 
              eskil={false}
              offset={0.15}
              darkness={0.4}
            />
            <ToneMapping 
              adaptive={true}
              resolution={128}
              middleGrey={0.4}
              maxLuminance={16}
              averageLuminance={1}
              adaptationRate={2}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      {/* Enhanced UI Overlay */}
      <HUD />
    </div>
  );
};
