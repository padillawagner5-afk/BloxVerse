import React from 'react';
import { GameMode } from '../types/blox';
import { Volume2, VolumeX, Compass, User, Hammer, Play, ShoppingBag, Users, Sparkles } from 'lucide-react';

interface TopNavProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  coins: number;
  username: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickPlay: () => void;
  onOpenAccountModal: () => void;
  friendsCount?: number;
  pendingRequestsCount?: number;
  onOpenFriendsModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onSelectMode,
  coins,
  username,
  isMuted,
  onToggleMute,
  onQuickPlay,
  onOpenAccountModal,
  friendsCount = 0,
  pendingRequestsCount = 0,
  onOpenFriendsModal,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 select-none z-30 shrink-0">
      {/* Zone 1: Roblox Tilt Cube Logo & Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectMode('discover')}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg group cursor-pointer"
        >
          {/* Iconic tilted square Roblox-style logo */}
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center shadow-md transform -rotate-12 group-hover:rotate-0 transition-transform">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-xs transform rotate-12" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            BloxVerse
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
        <button
          onClick={() => onSelectMode('discover')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 cursor-pointer ${
            currentMode === 'discover'
              ? 'text-white border-b-2 border-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-red-500" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => onSelectMode('catalog')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 cursor-pointer ${
            currentMode === 'catalog'
              ? 'text-white border-b-2 border-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => onSelectMode('avatar-editor')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 cursor-pointer ${
            currentMode === 'avatar-editor'
              ? 'text-white border-b-2 border-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>Avatar Editor</span>
        </button>

        <button
          onClick={() => {
            onSelectMode('playing');
          }}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 cursor-pointer ${
            currentMode === 'playing'
              ? 'text-white border-b-2 border-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <Hammer className="w-4 h-4 text-blue-400" />
          <span>Play & Create</span>
        </button>
      </nav>

      {/* Zone 3: Friends, Robux, Account Profile, Audio, CTA */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Friends Button with Pending Badge */}
        <button
          onClick={onOpenFriendsModal}
          title="Friends & Social"
          className="relative flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700/80 text-xs font-bold transition-all shadow-inner cursor-pointer"
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Friends</span>
          {friendsCount > 0 && (
            <span className="text-[11px] text-slate-400 font-mono">({friendsCount})</span>
          )}

          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black rounded-full shadow-md animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        {/* Robux / Coins */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-lg border border-slate-700/80 text-xs font-bold text-amber-300 shadow-inner">
          <span className="text-amber-400 font-black text-sm">R$</span>
          <span className="font-mono tabular-nums text-sm">{coins.toLocaleString()}</span>
        </div>

        {/* User Account / Profile Button */}
        <button
          onClick={onOpenAccountModal}
          title="Account & Profile"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/80 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">
            🤠
          </div>
          <span className="hidden sm:inline max-w-[90px] truncate">{username}</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Quick Play CTA */}
        {currentMode !== 'playing' ? (
          <button
            onClick={onQuickPlay}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 active:scale-95 transition-all rounded-lg shadow-md whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Play</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectMode('discover')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg whitespace-nowrap cursor-pointer"
          >
            Hub
          </button>
        )}
      </div>
    </header>
  );
};
