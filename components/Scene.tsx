import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles, ContactShadows, Float } from '@react-three/drei';
import { TreeGeometry } from './TreeGeometry';
import { Ornaments } from './Ornaments';
import { FairyLights } from './Lights';
import { Effects } from './Effects';
import { TreeConfig } from '../types';
import { THEME } from '../constants';

interface SceneProps {
  config: TreeConfig;
}

const StarTopper: React.FC<{ isExploded: boolean }> = ({ isExploded }) => {
  return (
    // Hide or fly away when exploded? Let's just fly up high.
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={[0, isExploded ? 8 : 4.2, 0]}>
        <mesh>
          <octahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial color={THEME.colors.gold} toneMapped={false} />
        </mesh>
        <pointLight color={THEME.colors.gold} intensity={2} distance={5} decay={2} />
        {/* Glow halo */}
        <mesh scale={[1.5, 1.5, 1.5]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color={THEME.colors.champagne} transparent opacity={0.2} depthWrite={false} side={2} />
        </mesh>
      </group>
    </Float>
  );
}

export const Scene: React.FC<SceneProps> = ({ config }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, stencil: false, alpha: false }}>
      <color attach="background" args={[THEME.colors.emeraldDark]} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />
      <OrbitControls 
        autoRotate={config.rotationSpeed > 0 && !config.isExploded} // Stop rotating when exploded for dramatic effect
        autoRotateSpeed={config.rotationSpeed}
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={15}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#ccffcc" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.25} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        shadow-bias={-0.0001}
        color={THEME.colors.champagne}
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color={THEME.colors.emerald} />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* The Tree Group */}
      <group position={[0, -1, 0]}>
        <TreeGeometry isExploded={config.isExploded} />
        <Ornaments color={config.ornamentColor} isExploded={config.isExploded} />
        <FairyLights color={config.lightColor} isExploded={config.isExploded} />
        <StarTopper isExploded={config.isExploded} />
      </group>

      {/* Floor Shadows - Fade out when exploded */}
      <ContactShadows opacity={config.isExploded ? 0 : 0.4} scale={20} blur={2} far={4} color="#000000" smooth={true} />

      {/* Atmosphere */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={10} size={4} speed={0.4} opacity={0.5} color={THEME.colors.gold} />

      <Suspense fallback={null}>
        <Effects bloomIntensity={config.bloomIntensity} />
      </Suspense>
    </Canvas>
  );
};