import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface EffectsProps {
    bloomIntensity: number;
}

export const Effects: React.FC<EffectsProps> = ({ bloomIntensity }) => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={bloomIntensity} 
        mipmapBlur 
        radius={0.6}
      />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={0.6} />
      <ToneMapping adaptive={true} resolution={256} middleGrey={0.6} maxLuminance={16.0} averageLuminance={1.0} adaptationRate={1.0} />
    </EffectComposer>
  );
};