import React, { useState } from 'react';
import { Friend, FriendRequest, WorldId } from '../types/blox';
import { bloxAudio } from '../audio/soundEffects';
import confetti from 'canvas-confetti';
import {
  Users,
  UserPlus,
  Mail,
  Check,
  X,
  Play,
  Search,
  Sparkles,
  Shield,
  Clock,
  UserMinus,
  ArrowRight,
} from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    displayName: string;
  };
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  onAcceptRequest: (req: FriendRequest) => void;
  onDeclineRequest: (reqId: string) => void;
  onSendFriendRequest: (username: string) => { success: boolean; message: string };
  onRemoveFriend: (friendId: string) => void;
  onJoinGame: (worldId: WorldId) => void;
}

// Famous community creators and players ready to be friended
const COMMUNITY_LEGENDS = [
  {
    username: 'Builderman',
    displayName: 'Builderman (CEO)',
    role: 'Roblox Master Builder',
    avatarHat: 'chef',
    avatarColor: '#facc15',
    bio: 'Creator of the Roblox Studio Baseplate and building tools.',
  },
  {
    username: 'Telamon',
    displayName: 'Telamon / Shedletsky',
    role: 'Crossroads Champion',
    avatarHat: 'fedora',
    avatarColor: '#ef4444',
    bio: 'Legendary sword duelist and fried chicken enthusiast.',
  },
  {
    username: 'Stickmasterluke',
    displayName: 'Stickmasterluke',
    role: 'Disaster Specialist',
    avatarHat: 'visor',
    avatarColor: '#0284c7',
    bio: 'Survives tsunamis, acid floods, and falling meteors daily.',
  },
  {
    username: 'Clockwork',
    displayName: 'Clockwork',
    role: 'Classic Blox Pioneer',
    avatarHat: 'crown',
    avatarColor: '#a855f7',
    bio: 'Pioneer of high-altitude sword fighting and classic gear.',
  },
  {
    username: 'Badimo',
    displayName: 'Badimo Studios',
    role: 'Speedway Developer',
    avatarHat: 'valkyrie',
    avatarColor: '#06b6d4',
    bio: 'High velocity speed tracks and neon vehicle physics.',
  },
  {
    username: 'NoobMaster_99',
    displayName: 'NoobMaster_99',
    role: 'Mega Obby Pro',
    avatarHat: 'baconhair',
    avatarColor: '#22c55e',
    bio: 'Conquering 100 stages of rainbow jumps without touching lava.',
  },
  {
    username: 'Guest 1337',
    displayName: 'Guest 1337 (Pro)',
    role: 'BrickBattler Elite',
    avatarHat: 'none',
    avatarColor: '#f8fafc',
    bio: 'The mysterious master of rocket jumping and trampolines.',
  },
];

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  friends,
  incomingRequests,
  outgoingRequests,
  onAcceptRequest,
  onDeclineRequest,
  onSendFriendRequest,
  onRemoveFriend,
  onJoinGame,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [addUsernameInput, setAddUsernameInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSendRequest = (targetUsername: string) => {
    if (!targetUsername.trim()) return;
    const result = onSendFriendRequest(targetUsername.trim());
    setFeedbackMsg({ text: result.message, isError: !result.success });

    if (result.success) {
      bloxAudio.playVictory();
      confetti({ particleCount: 40, spread: 50 });
      setAddUsernameInput('');
    } else {
      bloxAudio.playOof();
    }

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const isFriend = (uName: string) => friends.some((f) => f.username.toLowerCase() === uName.toLowerCase());
  const isRequestSent = (uName: string) =>
    outgoingRequests.some((r) => r.receiverId.toLowerCase() === uName.toLowerCase());

  const filteredFriends = friends.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.displayName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* HEADER */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 transform -rotate-6">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Roblox Friends & Social</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {friends.length} Friends
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect with players, send friend requests, and join games together
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? 'border-red-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Friends ({friends.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'border-red-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Requests</span>
              {incomingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black rounded-full animate-bounce">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'border-red-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add Friends</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 border-b transition-all ${
              feedbackMsg.isError
                ? 'bg-red-950/80 text-red-300 border-red-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}
          >
            {feedbackMsg.isError ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search filter */}
            {friends.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search among friends..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {filteredFriends.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
                  👋
                </div>
                <h3 className="text-base font-bold text-white">No Friends Found</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  You haven't added any friends yet. Check out the "Add Friends" tab to find community legends like Builderman and Telamon!
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Find Friends to Add
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFriends.map((friend) => {
                  const isInGame = friend.status === 'in-game' && friend.currentWorldId;

                  return (
                    <div
                      key={friend.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Mini Avatar Headshot */}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg border border-white/10 shadow"
                            style={{ backgroundColor: friend.avatar.torsoColor || '#0284c7' }}
                          >
                            <span>
                              {friend.avatar.hat === 'fedora'
                                ? '🎩'
                                : friend.avatar.hat === 'crown'
                                ? '👑'
                                : friend.avatar.hat === 'visor'
                                ? '🔴'
                                : friend.avatar.hat === 'valkyrie'
                                ? '🪶'
                                : '🙂'}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">
                              {friend.displayName}
                            </div>
                            <div className="text-[11px] text-slate-400">@{friend.username}</div>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              friend.status === 'in-game'
                                ? 'bg-emerald-400 animate-pulse'
                                : friend.status === 'online'
                                ? 'bg-blue-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span
                            className={
                              friend.status === 'in-game'
                                ? 'text-emerald-400'
                                : friend.status === 'online'
                                ? 'text-blue-400'
                                : 'text-slate-400'
                            }
                          >
                            {friend.status === 'in-game'
                              ? 'In Game'
                              : friend.status === 'online'
                              ? 'Online'
                              : 'Offline'}
                          </span>
                        </div>
                      </div>

                      {/* Current Activity or World */}
                      {isInGame && friend.currentWorldTitle && (
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                          <span className="truncate">Playing: <strong className="text-white">{friend.currentWorldTitle}</strong></span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        {isInGame && friend.currentWorldId ? (
                          <button
                            onClick={() => {
                              bloxAudio.playVictory();
                              onJoinGame(friend.currentWorldId!);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Join Game</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Not in a server</span>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Remove @${friend.username} from your friends list?`)) {
                              onRemoveFriend(friend.id);
                              bloxAudio.playPlaceBrick();
                            }
                          }}
                          title="Remove Friend"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FRIEND REQUESTS (Incoming & Outgoing) */}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Incoming Requests */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Received Requests ({incomingRequests.length})</span>
              </h3>

              {incomingRequests.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  No pending friend requests.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-white/10"
                          style={{ backgroundColor: req.senderAvatar.torsoColor || '#0284c7' }}
                        >
                          🤠
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{req.senderDisplayName}</div>
                          <div className="text-[11px] text-slate-400">@{req.senderUsername} · {req.createdAt}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onAcceptRequest(req);
                            bloxAudio.playVictory();
                            confetti({ particleCount: 50, spread: 60 });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => {
                            onDeclineRequest(req.id);
                            bloxAudio.playPlaceBrick();
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Sent Requests ({outgoingRequests.length})</span>
              </h3>

              {outgoingRequests.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  No outgoing requests pending.
                </div>
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">To: @{req.receiverId}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({req.createdAt})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/40 text-[10px] font-bold">
                        Pending Approval...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADD FRIENDS (Search & Community Legends) */}
        {activeTab === 'add' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Custom Username Sender Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-red-500" />
                <span>Send Friend Request by Username</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addUsernameInput}
                  onChange={(e) => setAddUsernameInput(e.target.value)}
                  placeholder="Enter exact Roblox username (e.g. Builderman, Telamon)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendRequest(addUsernameInput);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => handleSendRequest(addUsernameInput)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </div>

            {/* Recommended Community Legends */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Community Legends & Creators</span>
                </h3>
                <span className="text-[11px] text-slate-500">Instant connection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMMUNITY_LEGENDS.map((legend) => {
                  const alreadyFriend = isFriend(legend.username);
                  const sent = isRequestSent(legend.username);

                  return (
                    <div
                      key={legend.username}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow border border-white/10 shrink-0"
                          style={{ backgroundColor: legend.avatarColor }}
                        >
                          <span>
                            {legend.avatarHat === 'fedora'
                              ? '🎩'
                              : legend.avatarHat === 'crown'
                              ? '👑'
                              : legend.avatarHat === 'chef'
                              ? '🧑‍🍳'
                              : legend.avatarHat === 'visor'
                              ? '🔴'
                              : legend.avatarHat === 'valkyrie'
                              ? '🪶'
                              : '😎'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate">
                            {legend.displayName}
                          </div>
                          <div className="text-[11px] text-amber-400 font-semibold">{legend.role}</div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {legend.bio}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono">@{legend.username}</span>

                        {alreadyFriend ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                            <Check className="w-3.5 h-3.5" />
                            <span>Friends</span>
                          </span>
                        ) : sent ? (
                          <span className="text-amber-400 text-xs font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                            Requested ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(legend.username)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Friend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Safe Chat & Friendly Community Filter Enabled</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
