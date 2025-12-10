import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME } from '../constants';
import { OrnamentData, OrnamentType } from '../types';

interface OrnamentsProps {
  color: string;
  isExploded: boolean;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ color, isExploded }) => {
  const baubleCount = 80;
  const giftCount = 30;
  
  const baubleRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);

  // Generate Data
  const { baubles, gifts } = useMemo(() => {
    const bData: OrnamentData[] = [];
    const gData: OrnamentData[] = [];
    
    // --- Helper to get random position on tree surface ---
    const getTreePos = (yMin: number, yMax: number, rScale: number) => {
        const y = yMin + Math.random() * (yMax - yMin);
        const progress = (y - (-3.0)) / 7.0; // Normalized height approx
        const rMax = 3.0 * (1.0 - progress);
        const r = rMax * (0.8 + Math.random() * 0.2); // Mostly on surface
        const theta = Math.random() * Math.PI * 2;
        return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
    };

    // --- Helper for scatter pos ---
    const getScatterPos = () => {
        const r = 8 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    };

    // 1. Baubles (Spheres)
    for (let i = 0; i < baubleCount; i++) {
        const tPos = getTreePos(-2.5, 3.5, 1);
        const sPos = getScatterPos();
        
        bData.push({
            position: [tPos.x, tPos.y, tPos.z],
            scatterPosition: [sPos.x, sPos.y, sPos.z],
            type: OrnamentType.SPHERE,
            scale: 0.15 + Math.random() * 0.1,
            color: Math.random() > 0.5 ? THEME.colors.gold : color, // Mix theme color with gold
            weight: 0.2 + Math.random() * 0.3, // Light
            phaseOffset: Math.random() * 100
        });
    }

    // 2. Gifts (Boxes)
    for (let i = 0; i < giftCount; i++) {
        const tPos = getTreePos(-2.8, 1.0, 1); // Gifts mostly lower down
        const sPos = getScatterPos();
        
        // Random saturated colors for gifts
        const giftColors = [THEME.colors.ruby, THEME.colors.sapphire, THEME.colors.gold];
        const gColor = giftColors[Math.floor(Math.random() * giftColors.length)];

        gData.push({
            position: [tPos.x, tPos.y, tPos.z],
            scatterPosition: [sPos.x, sPos.y, sPos.z],
            type: OrnamentType.BOX,
            scale: 0.2 + Math.random() * 0.15,
            color: gColor,
            weight: 0.8 + Math.random() * 0.2, // Heavy
            phaseOffset: Math.random() * 100
        });
    }

    return { baubles: bData, gifts: gData };
  }, [color]);

  useFrame((state, delta) => {
     const time = state.clock.elapsedTime;
     const tempObj = new THREE.Object3D();
     const lerpSpeed = 2.0 * delta;

     // --- Animate Baubles ---
     if (baubleRef.current) {
        for (let i = 0; i < baubleCount; i++) {
            const data = baubles[i];
            
            // Get current matrix to interpolate from
            baubleRef.current.getMatrixAt(i, tempObj.matrix);
            tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
            
            // Determine Target
            const tPos = new THREE.Vector3(...data.position);
            const sPos = new THREE.Vector3(...data.scatterPosition);
            let target = isExploded ? sPos : tPos;
            
            // Apply physics/motion
            if (isExploded) {
                // Lighter objects float more
                const floatAmp = (1.0 - data.weight) * 0.2; 
                target.y += Math.sin(time + data.phaseOffset) * floatAmp;
                target.x += Math.cos(time * 0.5 + data.phaseOffset) * floatAmp * 0.5;
            }

            tempObj.position.lerp(target, lerpSpeed);
            
            // Scale pop
            tempObj.scale.lerp(new THREE.Vector3(data.scale, data.scale, data.scale), lerpSpeed);
            
            // Rotation
            tempObj.rotation.x += delta * 0.5;
            tempObj.rotation.y += delta * 0.5;

            tempObj.updateMatrix();
            baubleRef.current.setMatrixAt(i, tempObj.matrix);
            
            // Dynamic Color Update (if needed, but instanced color is usually static buffer. 
            // For simple changing themes, we can just change material color or use setColorAt if strict individual control needed)
        }
        baubleRef.current.instanceMatrix.needsUpdate = true;
     }

     // --- Animate Gifts ---
     if (giftRef.current) {
         for (let i = 0; i < giftCount; i++) {
             const data = gifts[i];
             
             giftRef.current.getMatrixAt(i, tempObj.matrix);
             tempObj.matrix.decompose(tempObj.position, tempObj.quaternion, tempObj.scale);
             
             const tPos = new THREE.Vector3(...data.position);
             const sPos = new THREE.Vector3(...data.scatterPosition);
             let target = isExploded ? sPos : tPos;
             
             if (isExploded) {
                 // Heavy objects float slowly and less
                 const floatAmp = (1.0 - data.weight) * 0.05; 
                 target.y += Math.sin(time * 0.5 + data.phaseOffset) * floatAmp;
             }

             tempObj.position.lerp(target, lerpSpeed);
             tempObj.scale.lerp(new THREE.Vector3(data.scale, data.scale, data.scale), lerpSpeed);
             
             // Slow tumbled rotation for boxes
             tempObj.rotation.x += delta * 0.2;
             tempObj.rotation.z += delta * 0.1;

             tempObj.updateMatrix();
             giftRef.current.setMatrixAt(i, tempObj.matrix);
         }
         giftRef.current.instanceMatrix.needsUpdate = true;
     }
  });
  
  // Set initial colors once
  useMemo(() => {
      if (baubleRef.current) {
          baubles.forEach((b, i) => baubleRef.current!.setColorAt(i, new THREE.Color(b.color)));
          baubleRef.current.instanceColor!.needsUpdate = true;
      }
      if (giftRef.current) {
          gifts.forEach((g, i) => giftRef.current!.setColorAt(i, new THREE.Color(g.color)));
          giftRef.current.instanceColor!.needsUpdate = true;
      }
  }, [baubles, gifts]); // Re-run if data changes (which depends on color prop potentially)

  return (
    <group>
        {/* Baubles */}
        <instancedMesh ref={baubleRef} args={[undefined, undefined, baubleCount]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
                metalness={0.9} 
                roughness={0.1} 
                envMapIntensity={1.5}
            />
        </instancedMesh>

        {/* Gifts */}
        <instancedMesh ref={giftRef} args={[undefined, undefined, giftCount]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
                metalness={0.4} 
                roughness={0.3} 
                envMapIntensity={1.0}
            />
        </instancedMesh>
    </group>
  );
};