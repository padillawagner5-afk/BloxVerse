import { WorldId, WorldInfo } from '../types/blox';

// Curated seed data for iconic Roblox games with high-fidelity logos
const SEED_TITLES = [
  // Obby
  { title: 'Mega Rainbow Obby [100 Stages]', genre: 'Obby', baseWorld: 'obby', rating: 96, icon: '🌈', theme: 'rainbow' },
  { title: 'Tower of Hell: Infinite Climb', genre: 'Obby', baseWorld: 'speedrun', rating: 94, icon: '🗼', theme: 'rainbow' },
  { title: 'Escape the Evil Carnival Obby', genre: 'Obby', baseWorld: 'obby', rating: 92, icon: '🎪', theme: 'rainbow' },
  { title: 'Speed Run 4: Neon Speedway', genre: 'Speed', baseWorld: 'speedrun', rating: 97, icon: '⚡', theme: 'speed' },
  { title: 'Impossible Glass Bridge Challenge', genre: 'Obby', baseWorld: 'obby', rating: 91, icon: '🌉', theme: 'rainbow' },
  { title: 'Lava Jump: Floor is Magma', genre: 'Obby', baseWorld: 'obby', rating: 93, icon: '🌋', theme: 'disaster' },
  { title: 'Ninja Parkour Academy', genre: 'Obby', baseWorld: 'speedrun', rating: 95, icon: '🥷', theme: 'speed' },

  // Action & Combat
  { title: 'Classic Crossroads [BrickBattle]', genre: 'Action', baseWorld: 'crossroads', rating: 95, icon: '⚔️', theme: 'combat' },
  { title: 'Sword Fight on the Heights IV', genre: 'Action', baseWorld: 'sfoth', rating: 96, icon: '🗡️', theme: 'combat' },
  { title: 'Doomspire Brickbattle', genre: 'Action', baseWorld: 'crossroads', rating: 94, icon: '💣', theme: 'combat' },
  { title: 'Arsenal: Blox Gunner Arena', genre: 'Action', baseWorld: 'crossroads', rating: 97, icon: '🎯', theme: 'combat' },
  { title: 'Laser Tag Battlestation', genre: 'Action', baseWorld: 'crossroads', rating: 92, icon: '🔫', theme: 'combat' },
  { title: 'Gladiator Sword Coliseum', genre: 'Action', baseWorld: 'sfoth', rating: 93, icon: '🛡️', theme: 'combat' },

  // Survival & Disaster
  { title: 'Natural Disaster Survival Island', genre: 'Survival', baseWorld: 'disaster', rating: 98, icon: '🌊', theme: 'disaster' },
  { title: 'Flood Escape: Acid Tides', genre: 'Survival', baseWorld: 'disaster', rating: 95, icon: '🧪', theme: 'disaster' },
  { title: 'Meteor Cataclysm: Bunker Run', genre: 'Survival', baseWorld: 'disaster', rating: 94, icon: '☄️', theme: 'disaster' },
  { title: 'Survive the Night Hunter', genre: 'Survival', baseWorld: 'disaster', rating: 91, icon: '🔦', theme: 'disaster' },
  { title: 'Lighthouse Sea Storm Escape', genre: 'Survival', baseWorld: 'disaster', rating: 93, icon: '🌪️', theme: 'disaster' },

  // Tycoon
  { title: 'Classic 2-Story Mega Tycoon', genre: 'Tycoon', baseWorld: 'tycoon', rating: 93, icon: '💰', theme: 'tycoon' },
  { title: 'Super Hero 3-Story Tycoon', genre: 'Tycoon', baseWorld: 'tycoon', rating: 94, icon: '🦸', theme: 'tycoon' },
  { title: 'Wizard Castle Magic Tycoon', genre: 'Tycoon', baseWorld: 'tycoon', rating: 92, icon: '🧙', theme: 'tycoon' },
  { title: 'Space Station Sci-Fi Tycoon', genre: 'Tycoon', baseWorld: 'tycoon', rating: 95, icon: '🚀', theme: 'tycoon' },
  { title: 'Military Base Armor Tycoon', genre: 'Tycoon', baseWorld: 'tycoon', rating: 91, icon: '🪖', theme: 'tycoon' },

  // Simulator & Roleplay
  { title: 'Mining Simulator: Diamond Deep', genre: 'Simulator', baseWorld: 'tycoon', rating: 94, icon: '⛏️', theme: 'simulator' },
  { title: 'Pet Simulator Blox [Hatch Eggs]', genre: 'Simulator', baseWorld: 'tycoon', rating: 96, icon: '🐾', theme: 'simulator' },
  { title: 'Brookhaven Life: Blox Town', genre: 'Roleplay', baseWorld: 'studio', rating: 95, icon: '🏡', theme: 'roleplay' },
  { title: 'Work at a Pizza Place 3D', genre: 'Roleplay', baseWorld: 'studio', rating: 97, icon: '🍕', theme: 'roleplay' },
  { title: 'Adopt Blox: Family & Pets', genre: 'Roleplay', baseWorld: 'studio', rating: 93, icon: '🐶', theme: 'roleplay' },

  // Sandbox & Studio
  { title: 'Roblox Studio: Free-Build Sandbox', genre: 'Sandbox', baseWorld: 'studio', rating: 98, icon: '🛠️', theme: 'studio' },
  { title: 'Classic 2006 Grey Baseplate', genre: 'Sandbox', baseWorld: 'studio', rating: 96, icon: '🧱', theme: 'studio' },
  { title: 'B-Tools Physics Playground', genre: 'Sandbox', baseWorld: 'studio', rating: 94, icon: '📐', theme: 'studio' },
];

const CREATORS = [
  'BloxVerse Studios',
  'Telamon',
  'Stickmasterluke',
  'Builderman',
  'Vurse',
  'Shedletsky',
  'Clockwork',
  'Erik.Cassel',
  'Badimo',
  'DreamCraft',
  'Big Games',
  'Loomian Legacy Team',
  'Easy.gg',
  'Rolve Community',
];

const COLOR_GRADIENTS = [
  'from-purple-600 via-pink-600 to-amber-500',
  'from-blue-600 via-cyan-600 to-slate-900',
  'from-amber-600 via-red-600 to-slate-900',
  'from-emerald-600 via-teal-600 to-slate-900',
  'from-cyan-500 via-blue-600 to-indigo-950',
  'from-sky-600 via-indigo-600 to-slate-900',
  'from-orange-600 via-amber-600 to-slate-900',
  'from-rose-600 via-pink-600 to-purple-950',
];

const BADGES = ['🔥 POPULAR', '⭐ TOP RATED', '👑 CLASSIC', '⚡ FEATURED', '💎 PRESTIGE', '🎉 UPDATED'];

/**
 * Generates an expansive database of 1,248 authentic Roblox games with custom logos.
 */
export function generateGamesDatabase(): WorldInfo[] {
  const games: WorldInfo[] = [];

  // 1. First add the handcrafted flagship seed experiences
  SEED_TITLES.forEach((seed, idx) => {
    games.push({
      id: seed.baseWorld as WorldId,
      title: seed.title,
      creator: CREATORS[idx % CREATORS.length],
      genre: seed.genre,
      rating: seed.rating,
      activePlayers: `${((idx * 7 + 12) % 45 + 5).toFixed(1)}K`,
      visits: `${(idx * 3.4 + 14).toFixed(1)}M`,
      description: `Experience the thrill of ${seed.title}! Jump into multiplayer 3D action with custom physics, sound effects, and live player servers.`,
      thumbnailColor: COLOR_GRADIENTS[idx % COLOR_GRADIENTS.length],
      badge: BADGES[idx % BADGES.length],
      logoIcon: seed.icon,
      logoTheme: seed.theme,
    });
  });

  // 2. Procedurally generate the remaining games to reach 1,248+ experiences
  const prefixes = ['Ultimate', 'Super', 'Epic', 'Classic', 'Mega', 'Hyper', 'Extreme', 'Neon', 'Infinite', 'Galaxy'];
  const themes = ['Obstacle Course', 'Parkour Race', 'Sword Arena', 'Disaster Survival', 'Island Tycoon', 'Sky Battles', 'Dungeon Escape', 'Speedway', 'Castle Defense', 'Physics Lab', 'Labyrinth', 'Boss Battle'];
  const suffixes = ['V2.0', '[REMASTERED]', '[SEASON 4]', '[NEW UPDATE]', 'Edition', '[X2 COINS]', 'Simulator', 'Legacy'];

  const worldTypes: WorldId[] = ['obby', 'crossroads', 'tycoon', 'studio', 'disaster', 'speedrun', 'sfoth'];
  const genres = ['Obby', 'Action', 'Survival', 'Tycoon', 'Speed', 'Simulator', 'Roleplay', 'Sandbox'];

  const genreIcons: Record<string, { icons: string[]; theme: string }> = {
    Obby: { icons: ['🌈', '🏃', '🧗', '🎪', '🧱'], theme: 'rainbow' },
    Action: { icons: ['⚔️', '💣', '🛡️', '🎯', '💥'], theme: 'combat' },
    Survival: { icons: ['🌊', '☄️', '🌪️', '🔥', '🌋'], theme: 'disaster' },
    Speed: { icons: ['⚡', '🏎️', '🚀', '💨', '✨'], theme: 'speed' },
    Tycoon: { icons: ['💰', '💎', '🏭', '🏦', '👑'], theme: 'tycoon' },
    Sandbox: { icons: ['🛠️', '📐', '🧱', '⚙️', '🏗️'], theme: 'studio' },
    Simulator: { icons: ['🐾', '⛏️', '🥚', '🔮', '✨'], theme: 'simulator' },
    Roleplay: { icons: ['🍕', '🏡', '👶', '🚔', '🍔'], theme: 'roleplay' },
  };

  for (let i = games.length; i < 1248; i++) {
    const pref = prefixes[i % prefixes.length];
    const theme = themes[(i * 3) % themes.length];
    const suff = suffixes[(i * 7) % suffixes.length];
    const genre = genres[(i * 2) % genres.length];
    const baseWorld = worldTypes[i % worldTypes.length];
    const creator = CREATORS[i % CREATORS.length];

    const activeNum = ((i * 13) % 92 + 1) / 10;
    const visitsNum = ((i * 17) % 650 + 10) / 10;

    const gInfo = genreIcons[genre] || { icons: ['🎮'], theme: 'combat' };
    const logoIcon = gInfo.icons[i % gInfo.icons.length];
    const logoTheme = gInfo.theme;

    games.push({
      id: baseWorld,
      title: `${pref} ${theme} ${i > 40 ? `(#${i}) ` : ''}${suff}`,
      creator,
      genre,
      rating: Math.floor(88 + ((i * 7) % 11)),
      activePlayers: `${activeNum.toFixed(1)}K`,
      visits: `${visitsNum.toFixed(1)}M`,
      description: `Join over ${visitsNum.toFixed(0)}M players in ${pref} ${theme}! Complete challenges, earn Robux, and compete on the global leaderboards.`,
      thumbnailColor: COLOR_GRADIENTS[i % COLOR_GRADIENTS.length],
      badge: BADGES[i % BADGES.length],
      logoIcon,
      logoTheme,
    });
  }

  return games;
}

export const ALL_GAMES = generateGamesDatabase();
