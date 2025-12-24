
import React from 'react';
import { SceneMode } from '../types';

interface OverlayProps {
  loading: boolean;
  uiHidden: boolean;
  mode: SceneMode;
  setMode: (mode: SceneMode) => void;
  onUploadClick: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ loading, uiHidden, mode, setMode, onUploadClick }) => {
  const modes: SceneMode[] = [SceneMode.TREE, SceneMode.SCATTER, SceneMode.FOCUS];

  return (
    <>
      {/* Loader */}
      <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-10 h-10 border-t border-[#d4af37] rounded-full animate-spin mb-4 shadow-[0_0_15px_#d4af37]"></div>
        <p className="cinzel text-[#d4af37] tracking-[0.2em] text-sm">LOADING HOLIDAY MAGIC</p>
      </div>

      {/* Main UI */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-500 pointer-events-none ${uiHidden ? 'opacity-0' : 'opacity-100'}`}>
        {/* Title */}
        <div className="absolute top-12 left-0 w-full flex justify-center">
          <h1 className="cinzel text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-[#d4af37] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Merry Christmas
          </h1>
        </div>

        {/* Mode Selector */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`glass w-32 py-2 cinzel text-xs tracking-widest transition-all duration-300 ${mode === m ? 'bg-[rgba(212,175,55,0.4)] text-white border-white scale-110' : 'text-[#d4af37]'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-4 pointer-events-auto">
          <div className="upload-wrapper">
            <button 
              onClick={onUploadClick}
              className="glass px-8 py-3 rounded-full cinzel text-[#fceea7] text-lg hover:bg-[rgba(212,175,55,0.2)] transition-all duration-300"
            >
              ADD MEMORIES
            </button>
          </div>
          <p className="text-[#d4af37] text-xs cinzel opacity-60 tracking-widest">PRESS 'H' TO HIDE CONTROLS • CLICK TO CYCLE MODES</p>
        </div>
      </div>
    </>
  );
};

export default Overlay;
