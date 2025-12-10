import React from 'react';
import { TreeConfig } from '../types';
import { Palette, RotateCw, Sun, Snowflake, Zap } from 'lucide-react';
import { THEME } from '../constants';

interface ControlsProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
}

const Button: React.FC<{ 
    onClick: () => void; 
    active?: boolean; 
    icon: React.ReactNode; 
    label: string 
}> = ({ onClick, active, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center w-16 h-16 rounded-full backdrop-blur-md transition-all duration-300 border
      ${active 
        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
        : 'bg-black/40 border-white/10 text-white/60 hover:bg-black/60 hover:text-white hover:border-white/30'}
    `}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-widest mt-1 font-sans font-semibold">{label}</span>
  </button>
);

export const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  
  const toggleRotation = () => {
    setConfig(prev => ({ ...prev, rotationSpeed: prev.rotationSpeed === 0 ? 0.5 : 0 }));
  };

  const toggleExplode = () => {
    setConfig(prev => ({ ...prev, isExploded: !prev.isExploded }));
  };

  const setGoldTheme = () => {
    setConfig(prev => ({ ...prev, ornamentColor: THEME.colors.gold, lightColor: THEME.colors.champagne }));
  };

  const setRubyTheme = () => {
    setConfig(prev => ({ ...prev, ornamentColor: THEME.colors.ruby, lightColor: THEME.colors.gold }));
  };

  const setSapphireTheme = () => {
    setConfig(prev => ({ ...prev, ornamentColor: THEME.colors.sapphire, lightColor: '#A0C4FF' }));
  };

  return (
    <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-6 pointer-events-none">
      <div className="pointer-events-auto flex gap-4 p-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-xl shadow-2xl">
        <Button 
            onClick={toggleExplode} 
            active={config.isExploded} 
            icon={<Zap size={20} />} 
            label={config.isExploded ? "Reform" : "Burst"} 
        />
        <div className="w-[1px] bg-white/10 mx-2" />
        <Button 
            onClick={toggleRotation} 
            active={config.rotationSpeed > 0} 
            icon={<RotateCw size={20} />} 
            label="Spin" 
        />
        <Button 
            onClick={setGoldTheme} 
            active={config.ornamentColor === THEME.colors.gold} 
            icon={<Sun size={20} />} 
            label="Gold" 
        />
        <Button 
            onClick={setRubyTheme} 
            active={config.ornamentColor === THEME.colors.ruby} 
            icon={<Palette size={20} />} 
            label="Ruby" 
        />
        <Button 
            onClick={setSapphireTheme} 
            active={config.ornamentColor === THEME.colors.sapphire} 
            icon={<Snowflake size={20} />} 
            label="Ice" 
        />
      </div>
    </div>
  );
};