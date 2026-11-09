import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, PlayerStats, ToolItem, WorldId } from '../types/blox';
import { DEFAULT_HOTBAR_TOOLS } from '../game/items';
import {
  MessageSquare,
  Users,
  RotateCcw,
  LogOut,
  Send,
  X,
  Smile,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  UserPlus,
  Check,
  UserCheck,
} from 'lucide-react';

interface InGameHudProps {
  worldId: WorldId;
  worldTitle: string;
  health: number;
  maxHealth: number;
  stage: number;
  coins: number;
  kos: number;
  wipeouts: number;
  equippedTool: ToolItem | null;
  onSelectTool: (tool: ToolItem | null) => void;
  onResetCharacter: () => void;
  onLeaveGame: () => void;
  onSendMessage: (text: string) => void;
  onTriggerEmote: (emote: 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin') => void;
  chatMessages: ChatMessage[];
  username: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onJoystickMove?: (vec: { x: number; y: number }) => void;
  onJumpPress?: () => void;
  onActionPress?: () => void;
  onOpenFriendsModal?: () => void;
  onSendFriendRequest?: (username: string) => void;
  friendUsernames?: string[];
  pendingUsernames?: string[];
}

export const InGameHud: React.FC<InGameHudProps> = ({
  worldId,
  worldTitle,
  health,
  maxHealth,
  stage,
  coins,
  kos,
  wipeouts,
  equippedTool,
  onSelectTool,
  onResetCharacter,
  onLeaveGame,
  onSendMessage,
  onTriggerEmote,
  chatMessages,
  username,
  isMuted,
  onToggleMute,
  onJoystickMove,
  onJumpPress,
  onActionPress,
  onOpenFriendsModal,
  onSendFriendRequest,
  friendUsernames = [],
  pendingUsernames = [],
}) => {
  const [showEscapeMenu, setShowEscapeMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  // Keyboard shortcut listener (Tab for leaderboard, / for chat, Esc for menu)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Tab') {
        e.preventDefault();
        setShowLeaderboard((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setShowChat(true);
      } else if (e.code === 'Escape') {
        setShowEscapeMenu((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const quickPhrases = ['oof', 'gg', 'nice jump!', 'look at this build', 'help me!'];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden">
      {/* TOP IN-GAME BAR */}
      <div className="w-full p-3 flex items-start justify-between pointer-events-auto">
        {/* Left: Roblox Logo (Escape Menu) & Chat Toggle */}
        <div className="flex items-center gap-2">
          {/* Classic Roblox Tilt Cube Button */}
          <button
            onClick={() => setShowEscapeMenu(true)}
            title="Menu (Esc)"
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white border border-slate-700/80 rounded-xl flex items-center justify-center shadow-lg transition-all"
          >
            <div className="w-4 h-4 bg-red-600 rounded-sm transform -rotate-12 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-xs" />
            </div>
          </button>

          {/* Chat Button */}
          <button
            onClick={() => setShowChat((prev) => !prev)}
            title="Chat (/)"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-all ${
              showChat
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Emotes Button */}
          <button
            onClick={() => setShowEmotes((prev) => !prev)}
            title="Emotes"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-all ${
              showEmotes
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* World info badge with Logo Icon */}
          <div className="hidden sm:flex items-center gap-2.5 ml-1 px-3 py-1 bg-slate-900/85 backdrop-blur-sm rounded-xl border border-slate-800 text-xs shadow-md">
            <span className="text-xl p-1 bg-slate-950 rounded-lg border border-slate-800/80 shadow">
              {worldId === 'obby'
                ? '🌈'
                : worldId === 'crossroads'
                ? '⚔️'
                : worldId === 'disaster'
                ? '🌊'
                : worldId === 'speedrun'
                ? '⚡'
                : worldId === 'sfoth'
                ? '🗡️'
                : worldId === 'tycoon'
                ? '💰'
                : '🛠️'}
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-wide">{worldTitle}</span>
              <span className="text-slate-400 text-[10px]">
                {worldId === 'obby' && `Stage ${stage} / 5`}
                {worldId === 'crossroads' && `${kos} KOs · ${wipeouts} Wipeouts`}
                {worldId === 'disaster' && 'Disaster Island'}
                {worldId === 'speedrun' && 'Neon Speedway'}
                {worldId === 'sfoth' && 'Sword Heights'}
                {worldId === 'tycoon' && `R$ ${coins.toLocaleString()}`}
                {worldId === 'studio' && 'Creative Sandbox'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Classic Roblox Health Bar */}
        <div className="flex flex-col items-center">
          <div className="w-36 sm:w-48 h-5 bg-slate-900/90 border border-slate-700/80 rounded-full p-0.5 shadow-lg overflow-hidden flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                health > 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-amber-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (health / maxHealth) * 100))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-300 mt-0.5 tracking-wider font-semibold">
            {Math.round(health)} / {maxHealth} HP
          </span>
        </div>

        {/* Right: Friends, Leaderboard toggle & audio */}
        <div className="flex items-center gap-2">
          {onOpenFriendsModal && (
            <button
              onClick={onOpenFriendsModal}
              title="Friends & Social (F)"
              className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl flex items-center justify-center shadow-lg transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowLeaderboard((prev) => !prev)}
            title="Leaderboard (Tab)"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-all cursor-pointer ${
              showLeaderboard
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FLOATING CHAT BOX (When toggled open) */}
      {showChat && (
        <div className="absolute top-16 left-3 w-80 sm:w-96 max-h-80 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl flex flex-col p-3 pointer-events-auto backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-red-500" />
              Chat / Game Log
            </span>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-2 space-y-1.5 text-xs max-h-48 pr-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.isSystem
                    ? 'text-amber-400 italic font-mono text-[11px]'
                    : 'text-slate-200 leading-relaxed'
                }
              >
                {!msg.isSystem && (
                  <span className="font-bold text-blue-400 mr-1.5">[{msg.sender}]:</span>
                )}
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto border-t border-slate-800/80">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                onClick={() => onSendMessage(phrase)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] whitespace-nowrap transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Press Enter or send a message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              maxLength={80}
            />
            <button
              type="submit"
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* EMOTES WHEEL MODAL */}
      {showEmotes && (
        <div className="absolute top-16 left-16 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-3 pointer-events-auto flex flex-col gap-1.5 text-xs backdrop-blur-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-800">
            Emotes
          </div>
          <button
            onClick={() => {
              onTriggerEmote('dance');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>💃</span>
            <span>/e dance</span>
          </button>
          <button
            onClick={() => {
              onTriggerEmote('wave');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>👋</span>
            <span>/e wave</span>
          </button>
          <button
            onClick={() => {
              onTriggerEmote('cheer');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>🙌</span>
            <span>/e cheer</span>
          </button>
          <button
            onClick={() => {
              onTriggerEmote('point');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>👉</span>
            <span>/e point</span>
          </button>
          <button
            onClick={() => {
              onTriggerEmote('flip');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>🤸</span>
            <span>/e flip (Backflip)</span>
          </button>
          <button
            onClick={() => {
              onTriggerEmote('spin');
              setShowEmotes(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-left font-semibold text-white transition-colors"
          >
            <span>🌀</span>
            <span>/e spin</span>
          </button>
        </div>
      )}

      {/* LEADERBOARD OVERLAY (Tab key) */}
      {showLeaderboard && (
        <div className="absolute top-16 right-3 w-80 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl p-4 pointer-events-auto backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              Players in Server
            </span>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <table className="w-full mt-3 text-xs text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] border-b border-slate-800/80">
                <th className="pb-1.5 font-medium">Player</th>
                <th className="pb-1.5 text-center font-medium">KOs</th>
                <th className="pb-1.5 text-center font-medium">WOs</th>
                <th className="pb-1.5 text-right font-medium">
                  {worldId === 'obby' ? 'Stage' : 'Score'}
                </th>
                <th className="pb-1.5 text-right font-medium">Social</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              <tr className="font-bold text-yellow-300">
                <td className="py-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[80px]">{username} (You)</span>
                </td>
                <td className="text-center font-mono tabular-nums">{kos}</td>
                <td className="text-center font-mono tabular-nums">{wipeouts}</td>
                <td className="text-right font-mono tabular-nums">
                  {worldId === 'obby' ? stage : coins}
                </td>
                <td className="text-right">
                  <span className="text-[10px] text-slate-500 italic">Self</span>
                </td>
              </tr>
              {[
                { name: 'Builderman', kos: 12, wos: 1, val: worldId === 'obby' ? 4 : 450 },
                { name: 'Telamon', kos: 18, wos: 2, val: worldId === 'obby' ? 5 : 820 },
                { name: 'NoobMaster_99', kos: 3, wos: 7, val: worldId === 'obby' ? 2 : 120 },
                { name: 'Guest 1337', kos: 8, wos: 4, val: worldId === 'obby' ? 3 : 280 },
              ].map((bot) => {
                const isFriend = friendUsernames.some((f) => f.toLowerCase() === bot.name.toLowerCase());
                const isPending = pendingUsernames.some((p) => p.toLowerCase() === bot.name.toLowerCase());

                return (
                  <tr key={bot.name}>
                    <td className="py-2 text-slate-300 font-medium">{bot.name}</td>
                    <td className="text-center font-mono tabular-nums">{bot.kos}</td>
                    <td className="text-center font-mono tabular-nums">{bot.wos}</td>
                    <td className="text-right font-mono tabular-nums">{bot.val}</td>
                    <td className="text-right">
                      {isFriend ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          <Check className="w-3 h-3" /> Friends
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded">
                          Requested
                        </span>
                      ) : (
                        <button
                          onClick={() => onSendFriendRequest && onSendFriendRequest(bot.name)}
                          title={`Add ${bot.name} as friend`}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-bold rounded-md shadow cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ESCAPE MENU MODAL */}
      {showEscapeMenu && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center transform -rotate-12">
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs" />
                </div>
                <h2 className="text-lg font-bold text-white">BloxVerse Menu</h2>
              </div>
              <button
                onClick={() => setShowEscapeMenu(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => setShowEscapeMenu(false)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-colors"
              >
                Resume Game (Esc)
              </button>

              <button
                onClick={() => {
                  onResetCharacter();
                  setShowEscapeMenu(false);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset Character [R]</span>
              </button>

              {onOpenFriendsModal && (
                <button
                  onClick={() => {
                    setShowEscapeMenu(false);
                    onOpenFriendsModal();
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Friends & Social List (👥)</span>
                </button>
              )}

              <button
                onClick={() => {
                  onLeaveGame();
                  setShowEscapeMenu(false);
                }}
                className="w-full py-3 bg-slate-800 hover:bg-red-950 text-slate-200 hover:text-red-300 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Leave Game (Back to Discover)</span>
              </button>
            </div>

            {/* Help / Controls guide */}
            <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 mb-1">Keyboard & Mouse Controls:</div>
              <div className="flex justify-between">
                <span>Move:</span>
                <span className="font-mono text-slate-200">WASD / Arrow Keys</span>
              </div>
              <div className="flex justify-between">
                <span>Jump:</span>
                <span className="font-mono text-slate-200">Spacebar</span>
              </div>
              <div className="flex justify-between">
                <span>Camera Orbit:</span>
                <span className="font-mono text-slate-200">Right-Click + Drag / Scroll Zoom</span>
              </div>
              <div className="flex justify-between">
                <span>Hotbar Tools:</span>
                <span className="font-mono text-slate-200">Keys 1 - 6</span>
              </div>
              <div className="flex justify-between">
                <span>Use Tool / Attack:</span>
                <span className="font-mono text-slate-200">Left-Click</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CENTER: CLASSIC HOTBAR / BACKPACK (SLOTS 1-6) */}
      <div className="w-full pb-4 px-4 flex flex-col items-center pointer-events-auto">
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-md">
          {DEFAULT_HOTBAR_TOOLS.map((tool) => {
            const isEquipped = equippedTool?.id === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  if (isEquipped) {
                    onSelectTool(null); // Unequip
                  } else {
                    onSelectTool(tool); // Equip
                  }
                }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isEquipped
                    ? 'bg-slate-800 border-2 border-red-500 scale-105 shadow-md shadow-red-500/20'
                    : 'bg-slate-900/90 hover:bg-slate-800/80 border border-slate-700/60'
                }`}
              >
                {/* Hotkey Number Badge */}
                <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold text-slate-400">
                  {tool.slot}
                </span>

                {/* Tool Icon */}
                <span className="text-xl sm:text-2xl select-none mt-1">{tool.icon}</span>

                {/* Tool Mini Label */}
                <span className="text-[9px] font-semibold text-slate-300 truncate max-w-[48px] px-1">
                  {tool.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
