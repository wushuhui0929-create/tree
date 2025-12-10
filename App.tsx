import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import { ArixLogo } from './components/ArixLogo';
import { INITIAL_CONFIG } from './constants';
import { TreeConfig } from './types';

function App() {
  const [config, setConfig] = useState<TreeConfig>(INITIAL_CONFIG);

  return (
    <div className="relative w-full h-screen bg-[#011009] overflow-hidden">
        {/* Background Gradient for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-[#022D19]/30 to-black pointer-events-none z-0" />
        
        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
            <Scene config={config} />
        </div>

        {/* UI Overlay */}
        <ArixLogo />
        <Controls config={config} setConfig={setConfig} />

        {/* Loading / Credit text */}
        <div className="absolute bottom-4 right-4 text-white/20 text-[10px] font-sans pointer-events-none">
            EXPERIENCE BY ARIX
        </div>
    </div>
  );
}

export default App;