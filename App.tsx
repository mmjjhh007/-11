
import React, { useState, useEffect, useRef } from 'react';
import HolidayScene from './components/HolidayScene';
import Overlay from './components/Overlay';
import { SceneMode } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [uiHidden, setUiHidden] = useState(false);
  const [mode, setMode] = useState<SceneMode>(SceneMode.TREE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setUiHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && window.addPhotoToScene) {
          window.addPhotoToScene(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Three.js Canvas */}
      <HolidayScene 
        mode={mode} 
        setMode={setMode}
        setLoading={setLoading} 
      />

      {/* UI Overlay */}
      <Overlay 
        loading={loading}
        uiHidden={uiHidden}
        mode={mode}
        setMode={setMode}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default App;

declare global {
  interface Window {
    addPhotoToScene: (dataUrl: string) => void;
  }
}
