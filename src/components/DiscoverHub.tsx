import React, { useState, useMemo } from 'react';
import { WorldId, WorldInfo } from '../types/blox';
import { ALL_GAMES } from '../data/gamesDatabase';
import { bloxAudio } from '../audio/soundEffects';
import { GameLogoBadge } from './GameLogoBadge';
import {
  Play,
  ThumbsUp,
  Users,
  Sparkles,
  Award,
  Flame,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Shield,
  Compass,
  Server,
  Zap,
} from 'lucide-react';

interface DiscoverHubProps {
  onPlayWorld: (worldId: WorldId) => void;
  selectedWorld: WorldId;
}

// 7 Flagship worlds preserved for App.tsx compatibility and quick lookup
export const WORLDS_DATA: WorldInfo[] = ALL_GAMES.slice(0, 7);

const PAGE_SIZE = 24;

export const DiscoverHub: React.FC<DiscoverHubProps> = ({ onPlayWorld, selectedWorld }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [selectedModalGame, setSelectedModalGame] = useState<WorldInfo | null>(null);
  const [likedGames, setLikedGames] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'visits'>('popular');

  const genres = [
    'All',
    'Obby',
    'Action',
    'Survival',
    'Tycoon',
    'Speed',
    'Simulator',
    'Roleplay',
    'Sandbox',
  ];

  // Filtering over all 1,248+ games
  const filteredGames = useMemo(() => {
    let result = ALL_GAMES.filter((w) => {
      if (selectedGenre !== 'All' && w.genre !== selectedGenre) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          w.title.toLowerCase().includes(q) ||
          w.creator.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.genre.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'visits') {
      result = [...result].sort((a, b) => parseFloat(b.visits) - parseFloat(a.visits));
    }
    return result;
  }, [selectedGenre, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedGames = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE;
    return filteredGames.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredGames, activePage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      bloxAudio.playPlaceBrick();
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
      setJumpPageInput('');
    }
  };

  const toggleLike = (gameTitle: string) => {
    if (likedGames.includes(gameTitle)) {
      setLikedGames((prev) => prev.filter((t) => t !== gameTitle));
    } else {
      setLikedGames((prev) => [...prev, gameTitle]);
      bloxAudio.playCoin();
    }
  };

  const featured = ALL_GAMES[0] || WORLDS_DATA[0];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 space-y-8 select-none">
      {/* FEATURED SPOTLIGHT HERO BANNER WITH 3D LOGO EMBLEM */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/70 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-current text-red-500 animate-pulse" />
            <span>COMMUNITY SPOTLIGHT EXPERIENCE · 1,200+ CATALOG</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {featured.title}
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            {featured.description}
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-semibold pt-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              <span>{featured.rating}% Rating</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <Users className="w-4 h-4" />
              <span>{featured.activePlayers} Playing Now</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>By {featured.creator}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                bloxAudio.playVictory();
                onPlayWorld(featured.id);
              }}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-green-600/30 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Featured</span>
            </button>

            <button
              onClick={() => setSelectedModalGame(featured)}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Game Details
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup with 3D Logo Emblem */}
        <div
          className="w-full md:w-80 h-56 rounded-2xl bg-gradient-to-br from-amber-500 via-red-600 to-slate-900 p-1 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
          onClick={() => setSelectedModalGame(featured)}
        >
          <div className="w-full h-full bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <GameLogoBadge
              icon={featured.logoIcon || '🌈'}
              theme={featured.logoTheme || 'rainbow'}
              title={featured.title}
              size="lg"
            />
            <span className="text-base font-black text-white mt-2 line-clamp-1">{featured.title}</span>
            <span className="text-xs text-slate-400 mt-0.5">Multiplayer 3D Live Engine · Instant Join</span>
            <div className="mt-2 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Server Online ({featured.activePlayers} Players)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH, CATEGORIES & STATS BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-lg">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setCurrentPage(1);
                  bloxAudio.playPlaceBrick();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Search Bar & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search 1,248+ experiences..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="visits">Most Visited</option>
            </select>
          </div>
        </div>

        {/* Database Stats Badge */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-red-500" />
              <span>{filteredGames.length.toLocaleString()} Experiences Found</span>
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline">1,248 Total Indexed Games with Custom 3D Logos</span>
          </div>

          <div className="text-slate-400 font-medium">
            Page <span className="text-white font-bold">{activePage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* EXPERIENCES GRID (24 CARDS PER PAGE WITH CUSTOM LOGOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedGames.map((game, idx) => {
          const isLiked = likedGames.includes(game.title);

          return (
            <div
              key={`${game.title}_${idx}`}
              onClick={() => setSelectedModalGame(game)}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between group cursor-pointer"
            >
              {/* Thumbnail Container with Authentic Game Logo Badge */}
              <div
                className={`h-36 bg-gradient-to-br ${game.thumbnailColor} p-3 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Top strip: badge and favorite button */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white font-black text-[10px] rounded-md tracking-wider">
                    {game.badge}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(game.title);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-sm transition-transform active:scale-90 ${
                      isLiked ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Center: Custom 3D Game Logo Emblem */}
                <div className="flex items-center justify-center my-auto z-10">
                  <GameLogoBadge
                    icon={game.logoIcon || '🎮'}
                    theme={game.logoTheme || 'combat'}
                    title={game.title}
                    size="md"
                  />
                </div>

                {/* Bottom strip: genre & active player count */}
                <div className="flex items-center justify-between text-white drop-shadow z-10">
                  <span className="text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    {game.genre}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>{game.activePlayers}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-red-400 transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>By</span>
                    <span className="text-slate-300 font-semibold">{game.creator}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{game.rating}%</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      bloxAudio.playVictory();
                      onPlayWorld(game.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={activePage === 1}
            className="px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-xl border border-slate-800 text-slate-300 cursor-pointer"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-xl border border-slate-800 text-slate-300 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Page numbers around current */}
          <div className="flex items-center gap-1 px-2">
            {[activePage - 1, activePage, activePage + 1]
              .filter((p) => p >= 1 && p <= totalPages)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    p === activePage
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
          </div>

          <button
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-xl border border-slate-800 text-slate-300 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={activePage === totalPages}
            className="px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-850 disabled:opacity-40 rounded-xl border border-slate-800 text-slate-300 cursor-pointer"
          >
            Last ({totalPages})
          </button>
        </div>

        {/* Jump To Page Input */}
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Jump to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPageInput}
            onChange={(e) => setJumpPageInput(e.target.value)}
            placeholder={`${activePage}`}
            className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white text-center focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      {/* GAME DETAIL INSPECTION MODAL WITH LOGO */}
      {selectedModalGame && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header Thumbnail Banner */}
            <div
              className={`h-48 bg-gradient-to-br ${selectedModalGame.thumbnailColor} p-6 flex flex-col justify-between relative`}
            >
              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white font-black text-xs rounded-lg">
                  {selectedModalGame.badge}
                </span>

                <button
                  onClick={() => setSelectedModalGame(null)}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 z-10">
                <GameLogoBadge
                  icon={selectedModalGame.logoIcon || '🎮'}
                  theme={selectedModalGame.logoTheme || 'combat'}
                  title={selectedModalGame.title}
                  size="lg"
                />
                <div>
                  <h2 className="text-2xl font-black text-white drop-shadow">
                    {selectedModalGame.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-white/90 drop-shadow mt-1">
                    <span>By {selectedModalGame.creator}</span>
                    <span>·</span>
                    <span className="font-bold">{selectedModalGame.genre}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Playing</div>
                  <div className="text-sm font-black text-blue-400">{selectedModalGame.activePlayers}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Visits</div>
                  <div className="text-sm font-black text-amber-400">{selectedModalGame.visits}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rating</div>
                  <div className="text-sm font-black text-emerald-400">{selectedModalGame.rating}%</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Max Server</div>
                  <div className="text-sm font-black text-purple-400">50 Players</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  About Experience
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {selectedModalGame.description}
                </p>
              </div>

              {/* Badges / Tech Info */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span>All Ages Appropriate</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Server className="w-4 h-4" />
                  <span>Ultra Low Latency (24ms)</span>
                </div>
              </div>

              {/* Play CTA */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const id = selectedModalGame.id;
                    setSelectedModalGame(null);
                    bloxAudio.playVictory();
                    onPlayWorld(id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-black text-base rounded-2xl shadow-xl shadow-green-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Experience Now</span>
                </button>

                <button
                  onClick={() => toggleLike(selectedModalGame.title)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    likedGames.includes(selectedModalGame.title)
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedGames.includes(selectedModalGame.title) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
