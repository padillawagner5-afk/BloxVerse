import { CatalogItem } from '../types/blox';

const ICONIC_HATS: { name: string; icon: string; price: number; rarity: CatalogItem['rarity']; val: string }[] = [
  { name: 'Dominus Empyreus', icon: '👑', price: 15000, rarity: 'Limited U', val: 'dominus' },
  { name: 'Dominus Infernus', icon: '🔥', price: 25000, rarity: 'Limited U', val: 'dominus' },
  { name: 'Dominus Frigidus', icon: '❄️', price: 30000, rarity: 'Limited U', val: 'dominus' },
  { name: 'Dominus Astra', icon: '✨', price: 45000, rarity: 'Limited U', val: 'dominus' },
  { name: 'Sparkle Time Fedora', icon: '🎩', price: 2500, rarity: 'Limited U', val: 'fedora' },
  { name: 'Midnight Sparkle Time Fedora', icon: '🎩', price: 3800, rarity: 'Limited U', val: 'fedora' },
  { name: 'Golden Sparkle Time Fedora', icon: '🎩', price: 6000, rarity: 'Limited U', val: 'fedora' },
  { name: 'Valkyrie Helm', icon: '🪶', price: 8500, rarity: 'Legendary', val: 'valkyrie' },
  { name: 'Black Iron Valkyrie', icon: '⚔️', price: 12000, rarity: 'Limited U', val: 'valkyrie' },
  { name: 'Golden Imperial Crown', icon: '💎', price: 1500, rarity: 'Epic', val: 'crown' },
  { name: 'Festive Golden Antlers', icon: '🦌', price: 1200, rarity: 'Epic', val: 'antlers' },
  { name: 'Silver Frost Antlers', icon: '❄️', price: 950, rarity: 'Epic', val: 'antlers' },
  { name: 'Victorian Gentleman Top Hat', icon: '🎩', price: 350, rarity: 'Rare', val: 'tophat' },
  { name: 'Classic Red Visor', icon: '🔴', price: 100, rarity: 'Common', val: 'visor' },
  { name: 'Master Chef Toque', icon: '🧑‍🍳', price: 80, rarity: 'Common', val: 'chef' },
  { name: 'Classic Pal Hair (Bacon)', icon: '💇', price: 0, rarity: 'Common', val: 'baconhair' },
];

const ICONIC_FACES: { name: string; icon: string; price: number; rarity: CatalogItem['rarity']; val: string }[] = [
  { name: 'Super Super Happy Face', icon: '🥰', price: 8000, rarity: 'Limited U', val: 'joy' },
  { name: 'Playful Vampire', icon: '🧛', price: 3500, rarity: 'Limited U', val: 'beast' },
  { name: 'Epic Meme Face', icon: '😀', price: 450, rarity: 'Legendary', val: 'epic' },
  { name: 'Chill Sunglasses Face', icon: '😎', price: 85, rarity: 'Rare', val: 'chill' },
  { name: 'Cyborg Laser Tactical HUD', icon: '🤖', price: 450, rarity: 'Epic', val: 'cyborg' },
  { name: 'Joyful Pink Blush Face', icon: '🥰', price: 120, rarity: 'Rare', val: 'joy' },
  { name: 'Beast Mode Battle Snarl', icon: '👹', price: 220, rarity: 'Epic', val: 'beast' },
  { name: 'Winning Smile', icon: '😄', price: 0, rarity: 'Common', val: 'winning' },
  { name: 'Classic Nostalgia Smile', icon: '🙂', price: 0, rarity: 'Common', val: 'smile' },
];

const ICONIC_SHIRTS: { name: string; icon: string; price: number; rarity: CatalogItem['rarity']; val: string }[] = [
  { name: 'Midnight Streetwear Hoodie', icon: '🧥', price: 150, rarity: 'Rare', val: 'hoodie' },
  { name: 'Nebula Cosmic Galaxy Tee', icon: '🌌', price: 200, rarity: 'Epic', val: 'galaxy' },
  { name: 'Tailored Black Tuxedo', icon: '👔', price: 120, rarity: 'Rare', val: 'tuxedo' },
  { name: 'Blox Builder Orange Overalls', icon: '🛠️', price: 90, rarity: 'Common', val: 'builder' },
  { name: 'Retro 2007 Striped Tee', icon: '👕', price: 0, rarity: 'Common', val: 'stripes' },
  { name: 'Classic "R" Logo Shirt', icon: '👕', price: 0, rarity: 'Common', val: 'classic' },
  { name: 'Sky Blue Classic Noob Torso', icon: '🟦', price: 0, rarity: 'Common', val: 'noob' },
];

export function generateCatalogDatabase(): CatalogItem[] {
  const items: CatalogItem[] = [];

  // 1. Add Handcrafted Flagship Items
  ICONIC_HATS.forEach((h, idx) => {
    items.push({
      id: `hat_flagship_${idx}`,
      name: h.name,
      category: 'hat',
      price: h.price,
      icon: h.icon,
      description: `Authentic Roblox headpiece: ${h.name}. Premium textured model with physics lighting and custom flair.`,
      rarity: h.rarity,
      assetType: 'hat',
      assetValue: h.val,
    });
  });

  ICONIC_FACES.forEach((f, idx) => {
    items.push({
      id: `face_flagship_${idx}`,
      name: f.name,
      category: 'face',
      price: f.price,
      icon: f.icon,
      description: `Iconic Roblox face decal: ${f.name}. Express your mood across every world in the BloxVerse.`,
      rarity: f.rarity,
      assetType: 'face',
      assetValue: f.val,
    });
  });

  ICONIC_SHIRTS.forEach((s, idx) => {
    items.push({
      id: `shirt_flagship_${idx}`,
      name: s.name,
      category: 'shirt',
      price: s.price,
      icon: s.icon,
      description: `Custom fitted torso clothing: ${s.name}. Stand out in the lobby and combat arenas.`,
      rarity: s.rarity,
      assetType: 'shirt',
      assetValue: s.val,
    });
  });

  // 2. Procedurally Generate to 2,160 Total Items
  const hatTypes = ['Fedora', 'Crown', 'Visor', 'Antlers', 'Helm', 'Top Hat', 'Cap', 'Beret', 'Beanie', 'Bandana', 'Halo', 'Horns'];
  const hatIcons = ['🎩', '👑', '🪶', '💎', '🦌', '🔴', '🧢', '✨', '⭐', '🌟', '🛡️', '⚡'];
  const hatVals = ['fedora', 'crown', 'visor', 'antlers', 'valkyrie', 'tophat', 'dominus', 'chef'];

  const faceAdjectives = ['Happy', 'Angry', 'Chill', 'Curious', 'Mysterious', 'Shocked', 'Smug', 'Cheery', 'Fierce', 'Heroic', 'Glitch', 'Laser'];
  const faceIcons = ['🙂', '😎', '😀', '😄', '👹', '🥰', '🤖', '🤩', '😏', '🧐', '😮', '🤠'];
  const faceVals = ['smile', 'chill', 'epic', 'winning', 'beast', 'joy', 'cyborg'];

  const shirtThemes = ['Hoodie', 'Jacket', 'Armor', 'Tee', 'Sweater', 'Uniform', 'Vest', 'Suit', 'Cape', 'Robes'];
  const shirtIcons = ['🧥', '👔', '👕', '🌌', '🥋', '🦺', '🥼', '🧵'];
  const shirtVals = ['hoodie', 'galaxy', 'tuxedo', 'builder', 'stripes', 'classic', 'noob'];

  const modifiers = ['Golden', 'Shadow', 'Crimson', 'Azure', 'Neon', 'Diamond', 'Emerald', 'Void', 'Cyber', 'Vintage', 'Retro', 'Galactic', 'Rainbow', 'Obsidian', 'Frost'];
  const rarities: CatalogItem['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary', 'Limited U'];

  let count = items.length;
  const targetCount = 2160;

  for (let i = count; i < targetCount; i++) {
    const mod = modifiers[i % modifiers.length];
    const itemTypeIndex = i % 3; // 0: Hat, 1: Face, 2: Shirt
    const rarity = rarities[i % rarities.length];

    if (itemTypeIndex === 0) {
      // Hat
      const hatType = hatTypes[(i * 3) % hatTypes.length];
      const icon = hatIcons[(i * 5) % hatIcons.length];
      const val = hatVals[i % hatVals.length];
      const price = i % 8 === 0 ? 0 : ((i * 37) % 1800) + 50;

      items.push({
        id: `hat_proc_${i}`,
        name: `${mod} ${hatType} ${i > 100 ? `(#${i})` : ''}`,
        category: 'hat',
        price,
        icon,
        description: `A stunning ${mod.toLowerCase()} ${hatType.toLowerCase()} to elevate your Roblox avatar aesthetic.`,
        rarity,
        assetType: 'hat',
        assetValue: val,
      });
    } else if (itemTypeIndex === 1) {
      // Face
      const faceAdj = faceAdjectives[(i * 2) % faceAdjectives.length];
      const icon = faceIcons[(i * 3) % faceIcons.length];
      const val = faceVals[i % faceVals.length];
      const price = i % 7 === 0 ? 0 : ((i * 23) % 900) + 40;

      items.push({
        id: `face_proc_${i}`,
        name: `${mod} ${faceAdj} Face`,
        category: 'face',
        price,
        icon,
        description: `Expressive ${mod.toLowerCase()} face with authentic Roblox decal rendering.`,
        rarity,
        assetType: 'face',
        assetValue: val,
      });
    } else {
      // Shirt
      const shirtTheme = shirtThemes[(i * 4) % shirtThemes.length];
      const icon = shirtIcons[(i * 2) % shirtIcons.length];
      const val = shirtVals[i % shirtVals.length];
      const price = i % 6 === 0 ? 0 : ((i * 19) % 650) + 30;

      items.push({
        id: `shirt_proc_${i}`,
        name: `${mod} ${shirtTheme} Edition`,
        category: 'shirt',
        price,
        icon,
        description: `Trendy ${mod.toLowerCase()} ${shirtTheme.toLowerCase()} tailored for classic R6 avatars.`,
        rarity,
        assetType: 'shirt',
        assetValue: val,
      });
    }
  }

  return items;
}

export const ALL_CATALOG_ITEMS = generateCatalogDatabase();
