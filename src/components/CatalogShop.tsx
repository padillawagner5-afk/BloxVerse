import React, { useState, useMemo } from 'react';
import { AvatarCustomization, CatalogItem } from '../types/blox';
import { ALL_CATALOG_ITEMS } from '../data/catalogDatabase';
import { bloxAudio } from '../audio/soundEffects';
import confetti from 'canvas-confetti';
import {
  Search,
  Sparkles,
  ShoppingBag,
  Check,
  Star,
  Coins,
  Shield,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CatalogShopProps {
  coins: number;
  onCoinsChange: (newCoins: number) => void;
  avatarCustomization: AvatarCustomization;
  onUpdateAvatar: (custom: AvatarCustomization) => void;
  inventory: string[];
  onAddToInventory: (itemId: string) => void;
  onOpenAvatarShop: () => void;
}

export const CATALOG_ITEMS: CatalogItem[] = ALL_CATALOG_ITEMS;

const PAGE_SIZE = 32;

export const CatalogShop: React.FC<CatalogShopProps> = ({
  coins,
  onCoinsChange,
  avatarCustomization,
  onUpdateAvatar,
  inventory,
  onAddToInventory,
  onOpenAvatarShop,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hat' | 'face' | 'shirt'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpInput, setJumpInput] = useState<string>('');

  // Filtering across all 2,160+ items
  const filteredItems = useMemo(() => {
    let result = ALL_CATALOG_ITEMS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.rarity.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, filterRarity, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, activePage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      bloxAudio.playPlaceBrick();
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
      setJumpInput('');
    }
  };

  const isItemEquipped = (item: CatalogItem) => {
    if (item.assetType === 'hat') return avatarCustomization.hat === item.assetValue;
    if (item.assetType === 'face') return avatarCustomization.face === item.assetValue;
    if (item.assetType === 'shirt') return avatarCustomization.shirt === item.assetValue;
    return false;
  };

  const isItemOwned = (item: CatalogItem) => {
    return item.price === 0 || inventory.includes(item.id);
  };

  const handleBuyOrEquip = (item: CatalogItem) => {
    const owned = isItemOwned(item);

    if (owned) {
      // Equip immediately!
      bloxAudio.playPlaceBrick();
      if (item.assetType === 'hat') {
        onUpdateAvatar({ ...avatarCustomization, hat: item.assetValue as any });
      } else if (item.assetType === 'face') {
        onUpdateAvatar({ ...avatarCustomization, face: item.assetValue as any });
      } else if (item.assetType === 'shirt') {
        onUpdateAvatar({ ...avatarCustomization, shirt: item.assetValue as any });
      }
      return;
    }

    // Purchase with Robux
    if (coins >= item.price) {
      onCoinsChange(coins - item.price);
      onAddToInventory(item.id);
      bloxAudio.playVictory();
      confetti({ particleCount: 70, spread: 60 });

      // Automatically equip newly bought item
      if (item.assetType === 'hat') {
        onUpdateAvatar({ ...avatarCustomization, hat: item.assetValue as any });
      } else if (item.assetType === 'face') {
        onUpdateAvatar({ ...avatarCustomization, face: item.assetValue as any });
      } else if (item.assetType === 'shirt') {
        onUpdateAvatar({ ...avatarCustomization, shirt: item.assetValue as any });
      }
    } else {
      bloxAudio.playOof();
      alert(`You need ${(item.price - coins).toLocaleString()} more Robux to purchase this item! Earn more in Tycoon or Obby.`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 space-y-6 select-none">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <ShoppingBag className="w-4 h-4" />
            <span>OFFICIAL ROBLOX CATALOG & MARKETPLACE · 2,000+ ITEMS</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Avatar Marketplace
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Discover limited hats, legendary gear, iconic faces, and tailored clothing. Purchase items with your earned Robux and customize your R6 blocky character live.
          </p>
        </div>

        {/* Currency & Quick Avatar Shop link */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Balance</div>
            <div className="flex items-center gap-1.5 text-amber-300 font-black text-xl">
              <span className="text-amber-400">R$</span>
              <span className="font-mono tabular-nums">{coins.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onOpenAvatarShop}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Avatar Editor 3D
          </button>
        </div>
      </div>

      {/* SEARCH, CATEGORIES & FILTERS BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-lg">
          {/* Category Segmented Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'hat', label: 'Hats & Gear' },
              { id: 'face', label: 'Faces' },
              { id: 'shirt', label: 'Clothing' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setCurrentPage(1);
                  bloxAudio.playPlaceBrick();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search 2,000+ catalog items..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Sort & Rarity filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterRarity}
              onChange={(e) => {
                setFilterRarity(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="Limited U">Limited U</option>
              <option value="Legendary">Legendary</option>
              <option value="Epic">Epic</option>
              <option value="Rare">Rare</option>
              <option value="Common">Common</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Catalog Stats & Page Indicator */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{filteredItems.length.toLocaleString()} Items Listed</span>
            </span>
            <span className="hidden sm:inline text-slate-500">·</span>
            <span className="hidden sm:inline">2,160 Total Items in Marketplace</span>
          </div>

          <div className="text-slate-400 font-medium">
            Page <span className="text-white font-bold">{activePage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* CATALOG GRID (32 ITEMS PER PAGE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {paginatedItems.map((item) => {
          const equipped = isItemEquipped(item);
          const owned = isItemOwned(item);

          const rarityColor =
            item.rarity === 'Limited U'
              ? 'text-amber-400 bg-amber-950/40 border-amber-500/50'
              : item.rarity === 'Legendary'
              ? 'text-purple-400 bg-purple-950/40 border-purple-500/50'
              : item.rarity === 'Epic'
              ? 'text-blue-400 bg-blue-950/40 border-blue-500/50'
              : item.rarity === 'Rare'
              ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/50'
              : 'text-slate-400 bg-slate-800/40 border-slate-700/50';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all hover:-translate-y-1 shadow-lg group cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="w-full h-28 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-900/60 transition-colors">
                <span className="text-4xl transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>

                {/* Rarity Tag */}
                <span
                  className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded border ${rarityColor}`}
                >
                  {item.rarity}
                </span>

                {/* Status Badge */}
                {equipped && (
                  <span className="absolute bottom-2 right-2 text-[8px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full flex items-center gap-1 shadow">
                    <Check className="w-2.5 h-2.5" /> Equipped
                  </span>
                )}
                {!equipped && owned && (
                  <span className="absolute bottom-2 right-2 text-[8px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                    Owned
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold">
                    {item.price === 0 ? (
                      <span className="text-emerald-400 font-sans">FREE</span>
                    ) : (
                      <>
                        <span className="text-amber-400">R$</span>
                        <span className="text-amber-300 tabular-nums">
                          {item.price.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyOrEquip(item);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      equipped
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : owned
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {equipped ? 'Equipped' : owned ? 'Wear' : 'Buy'}
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
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
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

      {/* ITEM DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  {selectedItem.icon}
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">{selectedItem.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize">{selectedItem.category}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">{selectedItem.rarity}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {selectedItem.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Price</div>
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-xl">
                  {selectedItem.price === 0 ? (
                    <span className="text-emerald-400 font-sans">FREE</span>
                  ) : (
                    <>
                      <span className="text-amber-400">R$</span>
                      <span>{selectedItem.price.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleBuyOrEquip(selectedItem);
                    setSelectedItem(null);
                  }}
                  className={`px-6 py-3 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer ${
                    isItemEquipped(selectedItem)
                      ? 'bg-slate-800 text-slate-400'
                      : isItemOwned(selectedItem)
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  {isItemEquipped(selectedItem)
                    ? 'Already Wearing'
                    : isItemOwned(selectedItem)
                    ? 'Wear / Equip Item'
                    : `Buy for R$ ${selectedItem.price.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
