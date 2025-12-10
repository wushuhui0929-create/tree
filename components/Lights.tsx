import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightsProps {
    color: string;
    isExploded: boolean;
}

export const FairyLights: React.FC<LightsProps> = ({ color, isExploded }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  // Precompute positions
  const { treePositions, scatterPositions, randoms } = useMemo(() => {
    const tPos = new Float32Array(count * 3);
    const sPos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    // --- Tree Spiral Generation ---
    for (let i = 0; i < count; i++) {
        const t = i / count; 
        const angle = t * 25; 
        const height = -2.8 + t * 6.5; 
        const radius = 2.0 * (1 - t) + 0.1;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Noise
        const nx = (Math.random() - 0.5) * 0.2;
        const ny = (Math.random() - 0.5) * 0.2;
        const nz = (Math.random() - 0.5) * 0.2;

        tPos[i*3] = x + nx;
        tPos[i*3+1] = height + ny;
        tPos[i*3+2] = z + nz;
        
        rnd[i] = Math.random();

        // --- Scatter Generation ---
        const sr = 10 + Math.random() * 10;
        const stheta = Math.random() * Math.PI * 2;
        const sphi = Math.acos(2 * Math.random() - 1);
        
        sPos[i*3] = sr * Math.sin(sphi) * Math.cos(stheta);
        sPos[i*3+1] = sr * Math.sin(sphi) * Math.sin(stheta);
        sPos[i*3+2] = sr * Math.cos(sphi);
    }
    return { treePositions: tPos, scatterPositions: sPos, randoms: rnd };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const lerpFactor = 3.0 * state.clock.getDelta();

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
        // Current Pos
        const cx = positionAttribute.getX(i);
        const cy = positionAttribute.getY(i);
        const cz = positionAttribute.getZ(i);

        // Target Pos
        const tx = isExploded ? scatterPositions[i*3] : treePositions[i*3];
        const ty = isExploded ? scatterPositions[i*3+1] : treePositions[i*3+1];
        const tz = isExploded ? scatterPositions[i*3+2] : treePositions[i*3+2];

        // Lerp
        const nx = THREE.MathUtils.lerp(cx, tx, lerpFactor);
        const ny = THREE.MathUtils.lerp(cy, ty, lerpFactor);
        const nz = THREE.MathUtils.lerp(cz, tz, lerpFactor);

        positionAttribute.setXYZ(i, nx, ny, nz);
    }
    positionAttribute.needsUpdate = true;

    // Pulse size
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.size = 0.08 + Math.sin(time * 2) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={treePositions.length / 3}
          array={new Float32Array(treePositions)} // Initialize with tree positions
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.12}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};