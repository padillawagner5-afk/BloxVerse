import React, { useState } from 'react';
import { AvatarCustomization, UserAccount } from '../types/blox';
import { bloxAudio } from '../audio/soundEffects';
import confetti from 'canvas-confetti';
import { User, Key, UserPlus, LogIn, Check, X, Shield, Award, Calendar, Sparkles } from 'lucide-react';

interface AccountModalProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
  onCreateUser: (user: UserAccount) => void;
  onClose: () => void;
  coins: number;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onCreateUser,
  onClose,
  coins,
}) => {
  const [mode, setMode] = useState<'profile' | 'create' | 'login'>('profile');
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserToLogin, setSelectedUserToLogin] = useState(currentUser.id);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const trimmedUser = newUsername.trim().replace(/\s+/g, '_');
    const trimmedDisplay = newDisplayName.trim() || trimmedUser;

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      username: trimmedUser,
      displayName: trimmedDisplay,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      robux: 500, // Starter bonus!
      avatar: {
        username: trimmedUser,
        headColor: '#facc15',
        torsoColor: '#0284c7',
        leftArmColor: '#facc15',
        rightArmColor: '#facc15',
        leftLegColor: '#22c55e',
        rightLegColor: '#22c55e',
        hat: 'fedora',
        face: 'smile',
        shirt: 'classic',
      },
      inventory: ['hat_fedora', 'face_smile', 'shirt_classic'],
      badges: ['Welcome to BloxVerse', 'Beta Explorer'],
    };

    onCreateUser(newUser);
    bloxAudio.playVictory();
    confetti({ particleCount: 80, spread: 70 });
    setMode('profile');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find((u) => u.id === selectedUserToLogin);
    if (user) {
      onSelectUser(user);
      bloxAudio.playVictory();
      setMode('profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white transform -rotate-12 shadow">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">BloxVerse Account</h2>
              <div className="text-[11px] text-slate-400">Manage Profile & Players</div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-2 bg-slate-950/90 border-b border-slate-800/80 gap-1 text-xs">
          <button
            onClick={() => setMode('profile')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'profile' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'create' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Switch Account
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* PROFILE VIEW */}
          {mode === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border border-white/10">
                  🤠
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{currentUser.displayName}</span>
                    <Shield className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  </h3>
                  <div className="text-xs font-mono text-slate-400">@{currentUser.username}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {currentUser.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Robux Balance</div>
                  <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                    R$ {coins.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Badges Earned</div>
                  <div className="text-lg font-black text-blue-400 font-mono mt-0.5">
                    {currentUser.badges.length}
                  </div>
                </div>
              </div>

              {/* Badges showcase */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Badges Showcase:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUser.badges.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* CREATE ACCOUNT */}
          {mode === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>New accounts receive a starter bonus of 500 Robux!</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Username:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. BloxKnight_2026"
                  maxLength={18}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Display Name:</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Master Knight"
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Password (optional):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer mt-2"
              >
                Sign Up & Claim 500 R$
              </button>
            </form>
          )}

          {/* SWITCH / LOGIN ACCOUNT */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-xs text-slate-400">
                Choose an existing account on this device to sign in:
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allUsers.map((user) => {
                  const isSelected = selectedUserToLogin === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserToLogin(user.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                          🤠
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{user.displayName}</div>
                          <div className="text-[10px] text-slate-500">@{user.username}</div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-red-500" />}
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer mt-2"
              >
                Sign In to Selected Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
