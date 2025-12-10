import React from 'react';

export const ArixLogo: React.FC = () => {
  return (
    <div className="absolute top-8 left-0 right-0 z-10 flex flex-col items-center pointer-events-none select-none mix-blend-screen opacity-90">
      <h1 className="font-['Cinzel'] text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D6] via-[#D4AF37] to-[#8A6E2F] drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] tracking-[0.2em] text-center">
        ARIX
      </h1>
      <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-2 mb-1" />
      <span className="font-['Playfair_Display'] italic text-[#F7E7CE] text-sm tracking-widest uppercase opacity-80">
        Signature Collection
      </span>
    </div>
  );
};