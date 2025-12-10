import { ThreeElements } from '@react-three/fiber';

export interface TreeConfig {
  lightColor: string;
  ornamentColor: string;
  rotationSpeed: number;
  bloomIntensity: number;
  isExploded: boolean;
}

export enum OrnamentType {
  SPHERE = 'SPHERE',
  BOX = 'BOX'
}

export interface OrnamentData {
  position: [number, number, number]; // Final tree position
  scatterPosition: [number, number, number]; // Scatter position
  type: OrnamentType;
  scale: number;
  color: string;
  weight: number; // 0 to 1, affects float intensity
  phaseOffset: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}