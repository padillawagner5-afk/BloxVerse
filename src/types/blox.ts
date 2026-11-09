export type GameMode = 'discover' | 'playing' | 'avatar-editor' | 'catalog';

export type WorldId = 'obby' | 'crossroads' | 'tycoon' | 'studio' | 'disaster' | 'speedrun' | 'sfoth';

export interface WorldInfo {
  id: WorldId;
  title: string;
  creator: string;
  genre: string;
  rating: number; // e.g. 96%
  activePlayers: string; // e.g. "4.2K"
  visits: string; // e.g. "12.8M"
  description: string;
  thumbnailColor: string;
  badge: string;
  logoIcon?: string; // High-fidelity emblem icon
  logoTheme?: string; // Visual styling theme e.g. 'rainbow' | 'combat' | 'disaster' | 'speed' | 'tycoon' | 'studio'
}

export interface AvatarCustomization {
  username: string;
  headColor: string;
  torsoColor: string;
  leftArmColor: string;
  rightArmColor: string;
  leftLegColor: string;
  rightLegColor: string;
  hat: 'none' | 'fedora' | 'visor' | 'chef' | 'valkyrie' | 'dominus' | 'baconhair' | 'tophat' | 'antlers' | 'crown' | 'halo' | 'ninja' | 'headphones';
  face: 'smile' | 'chill' | 'epic' | 'winning' | 'beast' | 'joy' | 'cyborg' | 'cool' | 'star';
  shirt: 'classic' | 'stripes' | 'tuxedo' | 'builder' | 'noob' | 'hoodie' | 'galaxy' | 'golden' | 'camo';
  backAccessory?: 'none' | 'katanas' | 'wings' | 'cape';
  scale?: 'classic' | 'broad' | 'tall';
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'ultra';
  shadows: boolean;
  fieldOfView: number; // 60 - 90
  sfxVolume: number; // 0 - 100
  mouseSensitivity: number; // 1 - 5
  invertY: boolean;
  shiftLock: boolean;
  language: 'es' | 'en';
}

export interface ToolItem {
  id: string;
  name: string;
  slot: number; // 1-6
  icon: string;
  type: 'sword' | 'rocket' | 'gravity_coil' | 'speed_coil' | 'cola' | 'btools';
  cooldown: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface PlayerStats {
  id: string;
  name: string;
  avatar: AvatarCustomization;
  kos: number;
  wipeouts: number;
  stage: number;
  coins: number;
  isHost?: boolean;
}

export interface StudioPart {
  id: string;
  type: 'block' | 'wedge' | 'cylinder' | 'truss' | 'light' | 'spawn';
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  color: string;
  anchored: boolean;
  material: 'plastic' | 'neon' | 'glass' | 'wood' | 'metal';
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'hat' | 'face' | 'shirt' | 'gear' | 'animation';
  price: number; // 0 for free
  icon: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Limited U';
  assetType: 'hat' | 'face' | 'shirt';
  assetValue: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: AvatarCustomization;
  status: 'online' | 'in-game' | 'offline';
  currentWorldId?: WorldId;
  currentWorldTitle?: string;
  lastSeen?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar: AvatarCustomization;
  receiverId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  joinDate: string;
  robux: number;
  avatar: AvatarCustomization;
  inventory: string[]; // item IDs
  badges: string[];
  friends?: Friend[];
  incomingRequests?: FriendRequest[];
  outgoingRequests?: FriendRequest[];
}

