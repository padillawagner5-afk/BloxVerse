import React from 'react';
import { StudioPart } from '../types/blox';
import { Box, Triangle, Circle, Sun, Trash2, PaintBucket, Plus, Grid, RefreshCw } from 'lucide-react';

interface StudioToolbarProps {
  toolMode: 'place' | 'delete' | 'color';
  onChangeToolMode: (mode: 'place' | 'delete' | 'color') => void;
  activePartType: StudioPart['type'];
  onChangePartType: (type: StudioPart['type']) => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  activeMaterial: StudioPart['material'];
  onChangeMaterial: (mat: StudioPart['material']) => void;
  gridSnap: number;
  onChangeGridSnap: (snap: number) => void;
  onClearBuild: () => void;
}

const ROBLOX_COLORS = [
  { name: 'Brick Yellow', hex: '#facc15' },
  { name: 'Bright Blue', hex: '#0284c7' },
  { name: 'Bright Red', hex: '#ef4444' },
  { name: 'Lime Green', hex: '#22c55e' },
  { name: 'Bright Orange', hex: '#ea580c' },
  { name: 'Bright Violet', hex: '#a855f7' },
  { name: 'Dark Stone Grey', hex: '#334155' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Black', hex: '#0f172a' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Wood Brown', hex: '#78350f' },
];

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  toolMode,
  onChangeToolMode,
  activePartType,
  onChangePartType,
  activeColor,
  onChangeColor,
  activeMaterial,
  onChangeMaterial,
  gridSnap,
  onChangeGridSnap,
  onClearBuild,
}) => {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-20 pointer-events-auto backdrop-blur-md flex flex-wrap items-center justify-center gap-3 max-w-[94vw]">
      {/* Tool Mode selector */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onChangeToolMode('place')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            toolMode === 'place' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Place</span>
        </button>
        <button
          onClick={() => onChangeToolMode('delete')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            toolMode === 'delete' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
        <button
          onClick={() => onChangeToolMode('color')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            toolMode === 'color' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PaintBucket className="w-3.5 h-3.5" />
          <span>Recolor</span>
        </button>
      </div>

      {/* Part Type selector */}
      {toolMode === 'place' && (
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangePartType('block')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activePartType === 'block' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Block"
          >
            <Box className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangePartType('wedge')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activePartType === 'wedge' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Wedge Ramp"
          >
            <Triangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangePartType('cylinder')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activePartType === 'cylinder' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Cylinder"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangePartType('light')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activePartType === 'light' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Neon Light"
          >
            <Sun className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}

      {/* Material selector */}
      {toolMode === 'place' && (
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Mat:</span>
          {(['plastic', 'neon', 'glass'] as const).map((mat) => (
            <button
              key={mat}
              onClick={() => onChangeMaterial(mat)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-colors ${
                activeMaterial === mat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      )}

      {/* Grid snap selector */}
      <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
        <Grid className="w-3.5 h-3.5 text-slate-400 mr-1" />
        <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Snap:</span>
        {[1, 2, 4].map((snap) => (
          <button
            key={snap}
            onClick={() => onChangeGridSnap(snap)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
              gridSnap === snap ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            {snap}
          </button>
        ))}
      </div>

      {/* Color Swatches */}
      {(toolMode === 'place' || toolMode === 'color') && (
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-[220px]">
          {ROBLOX_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => onChangeColor(c.hex)}
              title={c.name}
              className={`w-5 h-5 rounded-md shrink-0 transition-transform ${
                activeColor === c.hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      )}

      {/* Reset Build */}
      <button
        onClick={onClearBuild}
        title="Reset Build"
        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
