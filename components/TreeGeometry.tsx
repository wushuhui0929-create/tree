import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME } from '../constants';

interface TreeGeometryProps {
  isExploded: boolean;
}

// Custom Shader Material for the Foliage
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Tree, 1 = Scattered
    uColorGreen: { value: new THREE.Color(THEME.colors.emerald) },
    uColorGold: { value: new THREE.Color(THEME.colors.gold) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    
    attribute vec3 aTreePos;
    attribute vec3 aScatterPos;
    attribute float aRandom;
    
    varying float vRandom;
    varying float vDepth;

    // Cubic ease in-out for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vRandom = aRandom;
      
      // Smooth interpolation
      float t = easeInOutCubic(uProgress);
      
      // Mix positions
      vec3 pos = mix(aTreePos, aScatterPos, t);
      
      // --- Tree State Animation (Breathing) ---
      // Only apply when close to tree state (t < 0.5)
      float breatheIntensity = (1.0 - t);
      float breathe = sin(uTime * 1.5 + pos.y * 3.0) * 0.02 * breatheIntensity;
      if (t < 0.1) {
          pos.x += pos.x * breathe;
          pos.z += pos.z * breathe;
      }
      
      // --- Scatter State Animation (Floating) ---
      // Apply when scattered
      float floatIntensity = t;
      float floatOffset = sin(uTime * 0.5 + aRandom * 20.0) * 0.5 * floatIntensity;
      pos.y += floatOffset;
      
      // Curl noise-like rotation for scatter
      if (t > 0.1) {
          float angle = sin(uTime * 0.2 + aRandom * 10.0) * 0.1 * t;
          float c = cos(angle);
          float s = sin(angle);
          // Simple Y-axis rotation jitter
          float nx = pos.x * c - pos.z * s;
          float nz = pos.x * s + pos.z * c;
          pos.x = nx;
          pos.z = nz;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Pass depth for slight fogging in frag
      vDepth = -mvPosition.z;

      // Size attenuation: Larger when closer
      gl_PointSize = (20.0 * (0.8 + aRandom * 0.4)) * (1.0 / -mvPosition.z);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorGreen;
    uniform vec3 uColorGold;
    
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      
      if (dist > 0.5) discard;
      
      // Soft glow gradient
      // Center is bright, edges are darker
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0); // Sharpen the point
      
      // Color mixing: Deep Green base, Gold tips/highlight
      // Randomness adds variety to needle age/light
      vec3 finalColor = mix(uColorGreen, uColorGold, strength * 0.15 + vRandom * 0.1);
      
      // Extra hot core
      if (dist < 0.1) {
          finalColor = mix(finalColor, vec3(1.0, 0.95, 0.8), 0.5);
      }
      
      gl_FragColor = vec4(finalColor, 0.9 * strength);
    }
  `
};

export const TreeGeometry: React.FC<TreeGeometryProps> = ({ isExploded }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const count = 12000; // Dense foliage

  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const tPos = new Float32Array(count * 3);
    const sPos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    // Use a dummy object for matrix calculations if needed, but here we do pure math
    const tierCount = 15; // More tiers for denser look

    for (let i = 0; i < count; i++) {
      // --- Tree Construction (Cone Layers) ---
      // We distribute points in a volume of a cone
      const tierIndex = Math.floor(Math.pow(Math.random(), 0.9) * tierCount);
      const tierProgress = tierIndex / tierCount; // 0 bottom, 1 top
      
      const yBase = -3.0;
      const totalHeight = 7.0;
      
      // Height distribution: biased towards bottom for fullness
      const h = Math.random(); 
      const y = yBase + h * totalHeight;
      const relY = h; // 0 to 1
      
      // Cone Radius at this height
      const maxRadius = 3.0 * (1.0 - relY); 
      // Volume distribution (not just surface)
      const r = maxRadius * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      
      const tx = r * Math.cos(theta);
      const tz = r * Math.sin(theta);
      
      tPos[i*3] = tx;
      tPos[i*3+1] = y;
      tPos[i*3+2] = tz;

      // --- Scatter Construction (Sphere Cloud) ---
      const sr = 10 + Math.random() * 8; // Large radius
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      
      sPos[i*3] = sr * Math.sin(sPhi) * Math.cos(sTheta);
      sPos[i*3+1] = sr * Math.sin(sPhi) * Math.sin(sTheta);
      sPos[i*3+2] = sr * Math.cos(sPhi);
      
      rnd[i] = Math.random();
    }
    
    return { 
      positions: tPos, // Initial positions buffer
      treePositions: tPos, 
      scatterPositions: sPos, 
      randoms: rnd 
    };
  }, []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly animate the uProgress uniform based on isExploded prop
      const target = isExploded ? 1 : 0;
      const speed = 2.0;
      const current = shaderRef.current.uniforms.uProgress.value;
      
      let next = current + (target - current) * speed * delta;
      // Clamp
      if (Math.abs(target - next) < 0.001) next = target;
      
      shaderRef.current.uniforms.uProgress.value = next;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTreePos" count={count} array={treePositions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={count} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};