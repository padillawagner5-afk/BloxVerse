import React from 'react';

interface GameLogoBadgeProps {
  icon: string;
  theme?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
}

export const GameLogoBadge: React.FC<GameLogoBadgeProps> = ({
  icon,
  theme = 'combat',
  title,
  size = 'md',
  showTitle = false,
}) => {
  // Theme-specific gradients and styling
  const getThemeStyles = () => {
    switch (theme) {
      case 'rainbow':
        return {
          bg: 'from-purple-600 via-pink-500 to-amber-400',
          border: 'border-pink-400/60',
          glow: 'shadow-pink-500/40',
          ring: 'ring-amber-300/30',
          textBg: 'bg-purple-950/90 text-pink-300 border-pink-500/40',
        };
      case 'combat':
        return {
          bg: 'from-red-600 via-rose-700 to-amber-600',
          border: 'border-red-400/60',
          glow: 'shadow-red-500/40',
          ring: 'ring-red-400/30',
          textBg: 'bg-red-950/90 text-red-300 border-red-500/40',
        };
      case 'disaster':
        return {
          bg: 'from-amber-600 via-orange-600 to-red-900',
          border: 'border-amber-400/60',
          glow: 'shadow-orange-500/40',
          ring: 'ring-orange-400/30',
          textBg: 'bg-amber-950/90 text-amber-300 border-amber-500/40',
        };
      case 'speed':
        return {
          bg: 'from-cyan-500 via-blue-600 to-indigo-900',
          border: 'border-cyan-400/60',
          glow: 'shadow-cyan-500/40',
          ring: 'ring-cyan-400/30',
          textBg: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40',
        };
      case 'tycoon':
        return {
          bg: 'from-emerald-500 via-teal-600 to-slate-900',
          border: 'border-emerald-400/60',
          glow: 'shadow-emerald-500/40',
          ring: 'ring-emerald-400/30',
          textBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40',
        };
      case 'studio':
        return {
          bg: 'from-orange-500 via-amber-600 to-slate-900',
          border: 'border-orange-400/60',
          glow: 'shadow-orange-500/40',
          ring: 'ring-orange-400/30',
          textBg: 'bg-orange-950/90 text-orange-300 border-orange-500/40',
        };
      case 'simulator':
        return {
          bg: 'from-fuchsia-600 via-purple-600 to-indigo-950',
          border: 'border-fuchsia-400/60',
          glow: 'shadow-purple-500/40',
          ring: 'ring-fuchsia-400/30',
          textBg: 'bg-purple-950/90 text-purple-300 border-purple-500/40',
        };
      case 'roleplay':
      default:
        return {
          bg: 'from-blue-600 via-indigo-600 to-slate-900',
          border: 'border-blue-400/60',
          glow: 'shadow-blue-500/40',
          ring: 'ring-blue-400/30',
          textBg: 'bg-blue-950/90 text-blue-300 border-blue-500/40',
        };
    }
  };

  const style = getThemeStyles();

  // Size configurations
  const sizeMap = {
    sm: {
      container: 'w-10 h-10',
      icon: 'text-lg',
      stud: 'w-1 h-1',
    },
    md: {
      container: 'w-16 h-16',
      icon: 'text-2xl',
      stud: 'w-1.5 h-1.5',
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'text-3xl',
      stud: 'w-2 h-2',
    },
    xl: {
      container: 'w-28 h-28',
      icon: 'text-5xl',
      stud: 'w-2.5 h-2.5',
    },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center shrink-0 group">
      {/* 3D Embossed Roblox Game Emblem */}
      <div
        className={`relative ${s.container} rounded-2xl bg-gradient-to-br ${style.bg} p-1 shadow-lg ${style.glow} border ${style.border} ring-2 ${style.ring} flex items-center justify-center transform transition-transform group-hover:scale-105 group-hover:rotate-2 select-none overflow-hidden`}
      >
        {/* Subtle decorative grid/studs pattern overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Gloss highlight reflex at top */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-xl" />

        {/* Central Beveled Logo Plate */}
        <div className="w-full h-full bg-slate-950/70 backdrop-blur-xs rounded-xl flex items-center justify-center relative shadow-inner border border-white/10">
          <span className={`${s.icon} drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] transform transition-transform group-hover:scale-110`}>
            {icon || '🎮'}
          </span>
        </div>
      </div>

      {/* Optional Short Title Banner */}
      {showTitle && (
        <span
          className={`mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border shadow-md max-w-[120px] truncate text-center ${style.textBg}`}
        >
          {title}
        </span>
      )}
    </div>
  );
};
