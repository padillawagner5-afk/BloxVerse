/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AvatarCustomization,
  ChatMessage,
  GameMode,
  ToolItem,
  WorldId,
  StudioPart,
  UserAccount,
  Friend,
  FriendRequest,
} from './types/blox';
import { BloxEngine } from './game/Engine';
import { bloxAudio } from './audio/soundEffects';
import { TopNav } from './components/TopNav';
import { DiscoverHub, WORLDS_DATA } from './components/DiscoverHub';
import { InGameHud } from './components/InGameHud';
import { AvatarEditor } from './components/AvatarEditor';
import { StudioToolbar } from './components/StudioToolbar';
import { CatalogShop } from './components/CatalogShop';
import { AccountModal } from './components/AccountModal';
import { FriendsModal } from './components/FriendsModal';
import { DEFAULT_HOTBAR_TOOLS } from './game/items';

const DEFAULT_AVATAR: AvatarCustomization = {
  username: 'BloxPlayer',
  headColor: '#facc15', // Bright yellow
  torsoColor: '#0284c7', // Bright blue
  leftArmColor: '#facc15',
  rightArmColor: '#facc15',
  leftLegColor: '#22c55e', // Bright green
  rightLegColor: '#22c55e',
  hat: 'fedora',
  face: 'smile',
  shirt: 'classic',
};

const DEFAULT_FRIENDS: Friend[] = [
  {
    id: 'f_builderman',
    username: 'Builderman',
    displayName: 'Builderman (CEO)',
    avatar: {
      username: 'Builderman',
      headColor: '#facc15',
      torsoColor: '#ea580c',
      leftArmColor: '#facc15',
      rightArmColor: '#facc15',
      leftLegColor: '#0f172a',
      rightLegColor: '#0f172a',
      hat: 'chef',
      face: 'winning',
      shirt: 'builder',
    },
    status: 'in-game',
    currentWorldId: 'studio',
    currentWorldTitle: 'Roblox Studio Sandbox',
  },
  {
    id: 'f_telamon',
    username: 'Telamon',
    displayName: 'Telamon',
    avatar: {
      username: 'Telamon',
      headColor: '#facc15',
      torsoColor: '#ef4444',
      leftArmColor: '#facc15',
      rightArmColor: '#facc15',
      leftLegColor: '#0f172a',
      rightLegColor: '#0f172a',
      hat: 'fedora',
      face: 'epic',
      shirt: 'classic',
    },
    status: 'in-game',
    currentWorldId: 'crossroads',
    currentWorldTitle: 'Classic Crossroads',
  },
];

const DEFAULT_INCOMING_REQUESTS: FriendRequest[] = [
  {
    id: 'req_noobmaster',
    senderId: 'usr_noobmaster',
    senderUsername: 'NoobMaster_99',
    senderDisplayName: 'NoobMaster_99',
    senderAvatar: {
      username: 'NoobMaster_99',
      headColor: '#facc15',
      torsoColor: '#0284c7',
      leftArmColor: '#facc15',
      rightArmColor: '#facc15',
      leftLegColor: '#22c55e',
      rightLegColor: '#22c55e',
      hat: 'baconhair',
      face: 'smile',
      shirt: 'noob',
    },
    receiverId: 'usr_default',
    createdAt: 'Today',
    status: 'pending',
  },
];

const DEFAULT_USER: UserAccount = {
  id: 'usr_default',
  username: 'BloxPlayer',
  displayName: 'Blox Master',
  joinDate: 'Nov 2026',
  robux: 1500,
  avatar: DEFAULT_AVATAR,
  inventory: ['hat_fedora', 'face_smile', 'shirt_classic'],
  badges: ['Welcome to BloxVerse', 'Beta Explorer', 'Obby Conqueror'],
  friends: DEFAULT_FRIENDS,
  incomingRequests: DEFAULT_INCOMING_REQUESTS,
  outgoingRequests: [],
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('discover');
  const [activeWorldId, setActiveWorldId] = useState<WorldId>('obby');
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showFriendsModal, setShowFriendsModal] = useState<boolean>(false);

  // Accounts & Profile state
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('bloxverse_users');
      return saved ? JSON.parse(saved) : [DEFAULT_USER];
    } catch {
      return [DEFAULT_USER];
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('bloxverse_current_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [avatarCustom, setAvatarCustom] = useState<AvatarCustomization>(() => currentUser.avatar || DEFAULT_AVATAR);
  const [coins, setCoins] = useState<number>(() => currentUser.robux || 1500);
  const [inventory, setInventory] = useState<string[]>(() => currentUser.inventory || ['hat_fedora']);

  // Friends & Social State
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('bloxverse_friends');
      return saved ? JSON.parse(saved) : (currentUser.friends || DEFAULT_FRIENDS);
    } catch {
      return DEFAULT_FRIENDS;
    }
  });

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(() => {
    try {
      const saved = localStorage.getItem('bloxverse_incoming_reqs');
      return saved ? JSON.parse(saved) : (currentUser.incomingRequests || DEFAULT_INCOMING_REQUESTS);
    } catch {
      return DEFAULT_INCOMING_REQUESTS;
    }
  });

  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>(() => {
    try {
      const saved = localStorage.getItem('bloxverse_outgoing_reqs');
      return saved ? JSON.parse(saved) : (currentUser.outgoingRequests || []);
    } catch {
      return [];
    }
  });

  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);
  const [stage, setStage] = useState(0);
  const [kos, setKos] = useState(0);
  const [wipeouts, setWipeouts] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [equippedTool, setEquippedTool] = useState<ToolItem | null>(DEFAULT_HOTBAR_TOOLS[0]);

  // Studio Toolbar state
  const [studioToolMode, setStudioToolMode] = useState<'place' | 'delete' | 'color'>('place');
  const [studioPartType, setStudioPartType] = useState<StudioPart['type']>('block');
  const [studioColor, setStudioColor] = useState<string>('#facc15');
  const [studioMaterial, setStudioMaterial] = useState<StudioPart['material']>('plastic');
  const [studioGridSnap, setStudioGridSnap] = useState<number>(2.0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'sys_1',
      sender: 'System',
      text: 'Welcome to BloxVerse 3D! Check out 1,248+ games with custom 3D logos, and send friend requests to play together.',
      time: '12:00',
      isSystem: true,
    },
    {
      id: 'sys_2',
      sender: 'Builderman',
      text: 'Hey there! Add me as a friend and join my Studio server anytime.',
      time: '12:00',
    },
  ]);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<BloxEngine | null>(null);

  // Sync state changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem('bloxverse_users', JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('bloxverse_friends', JSON.stringify(friends));
    } catch {}
  }, [friends]);

  useEffect(() => {
    try {
      localStorage.setItem('bloxverse_incoming_reqs', JSON.stringify(incomingRequests));
    } catch {}
  }, [incomingRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('bloxverse_outgoing_reqs', JSON.stringify(outgoingRequests));
    } catch {}
  }, [outgoingRequests]);

  useEffect(() => {
    try {
      const updatedUser = {
        ...currentUser,
        avatar: avatarCustom,
        robux: coins,
        inventory,
        friends,
        incomingRequests,
        outgoingRequests,
      };
      localStorage.setItem('bloxverse_current_user', JSON.stringify(updatedUser));
    } catch {}
  }, [currentUser, avatarCustom, coins, inventory, friends, incomingRequests, outgoingRequests]);

  // Friend Request Operations
  const handleSendFriendRequest = (targetUsername: string): { success: boolean; message: string } => {
    const cleanTarget = targetUsername.trim();
    if (!cleanTarget) return { success: false, message: 'Please enter a valid username.' };

    const selfUser = currentUser.displayName || avatarCustom.username;
    if (
      cleanTarget.toLowerCase() === selfUser.toLowerCase() ||
      cleanTarget.toLowerCase() === currentUser.username.toLowerCase()
    ) {
      return { success: false, message: 'You cannot send a friend request to yourself!' };
    }

    if (friends.some((f) => f.username.toLowerCase() === cleanTarget.toLowerCase())) {
      return { success: false, message: `You are already friends with @${cleanTarget}!` };
    }

    if (outgoingRequests.some((r) => r.receiverId.toLowerCase() === cleanTarget.toLowerCase())) {
      return { success: false, message: `Friend request to @${cleanTarget} is already pending.` };
    }

    const newReq: FriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderDisplayName: currentUser.displayName || avatarCustom.username,
      senderAvatar: avatarCustom,
      receiverId: cleanTarget,
      createdAt: 'Just now',
      status: 'pending',
    };

    setOutgoingRequests((prev) => [...prev, newReq]);

    // Automated acceptance from community legends / NPCs after 2 seconds
    const legendList = [
      'builderman',
      'telamon',
      'stickmasterluke',
      'clockwork',
      'badimo',
      'noobmaster_99',
      'guest 1337',
    ];
    const match = legendList.find((l) => l === cleanTarget.toLowerCase());

    if (match) {
      setTimeout(() => {
        const newFriend: Friend = {
          id: `friend_${match}_${Date.now()}`,
          username: cleanTarget,
          displayName: cleanTarget,
          avatar: {
            username: cleanTarget,
            headColor: '#facc15',
            torsoColor: match === 'telamon' ? '#ef4444' : match === 'builderman' ? '#ea580c' : '#0284c7',
            leftArmColor: '#facc15',
            rightArmColor: '#facc15',
            leftLegColor: '#0f172a',
            rightLegColor: '#0f172a',
            hat: match === 'telamon' ? 'fedora' : match === 'stickmasterluke' ? 'visor' : match === 'builderman' ? 'chef' : 'baconhair',
            face: 'smile',
            shirt: 'classic',
          },
          status: 'online',
          currentWorldId: match === 'telamon' ? 'crossroads' : match === 'stickmasterluke' ? 'disaster' : 'obby',
          currentWorldTitle: match === 'telamon' ? 'Classic Crossroads' : match === 'stickmasterluke' ? 'Natural Disaster' : 'Mega Rainbow Obby',
        };

        setOutgoingRequests((prev) => prev.filter((r) => r.receiverId.toLowerCase() !== cleanTarget.toLowerCase()));
        setFriends((prev) => {
          if (prev.some((f) => f.username.toLowerCase() === cleanTarget.toLowerCase())) return prev;
          return [...prev, newFriend];
        });
        bloxAudio.playVictory();
      }, 2000);
    }

    return { success: true, message: `Friend request sent to @${cleanTarget}!` };
  };

  const handleAcceptRequest = (req: FriendRequest) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));

    const newFriend: Friend = {
      id: `friend_${req.senderId}_${Date.now()}`,
      username: req.senderUsername,
      displayName: req.senderDisplayName,
      avatar: req.senderAvatar,
      status: 'online',
      currentWorldId: 'obby',
      currentWorldTitle: 'Mega Rainbow Obby',
    };

    setFriends((prev) => [...prev, newFriend]);
  };

  const handleDeclineRequest = (reqId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const handleJoinFriendGame = (worldId: WorldId) => {
    setActiveWorldId(worldId);
    setCurrentMode('playing');
  };

  // Switch or Create accounts
  const handleSelectAccount = (user: UserAccount) => {
    setCurrentUser(user);
    setAvatarCustom(user.avatar);
    setCoins(user.robux);
    setInventory(user.inventory);
    setFriends(user.friends || DEFAULT_FRIENDS);
    setIncomingRequests(user.incomingRequests || []);
    setOutgoingRequests(user.outgoingRequests || []);

    if (engineRef.current) {
      engineRef.current.avatar.updateCustomization(user.avatar);
      engineRef.current.coins = user.robux;
    }
  };

  const handleCreateAccount = (newUser: UserAccount) => {
    const fullUser: UserAccount = {
      ...newUser,
      friends: DEFAULT_FRIENDS,
      incomingRequests: DEFAULT_INCOMING_REQUESTS,
      outgoingRequests: [],
    };
    setAllUsers((prev) => [...prev, fullUser]);
    handleSelectAccount(fullUser);
  };

  const handleAddToInventory = (itemId: string) => {
    if (!inventory.includes(itemId)) {
      setInventory((prev) => [...prev, itemId]);
    }
  };

  // Initialize or update Engine when switching into 3D gameplay
  useEffect(() => {
    if (currentMode !== 'playing' || !canvasMountRef.current) {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    // Create engine
    const engine = new BloxEngine(canvasMountRef.current, activeWorldId, avatarCustom, {
      onHealthChange: (hp) => setHealth(hp),
      onCoinsChange: (c) => setCoins(c),
      onStageChange: (s) => setStage(s),
      onKosChange: (k) => setKos(k),
      onWipeoutsChange: (w) => setWipeouts(w),
      onChatMessage: (sender, text) => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_${Math.random()}`,
            sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      },
    });

    engineRef.current = engine;
    engine.equipTool(equippedTool);
    engine.coins = coins;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [currentMode, activeWorldId]);

  // Sync Studio state to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.studioToolMode = studioToolMode;
      engineRef.current.studioActivePartType = studioPartType;
      engineRef.current.studioActiveColor = studioColor;
      engineRef.current.studioActiveMaterial = studioMaterial;
      engineRef.current.studioGridSnap = studioGridSnap;
    }
  }, [studioToolMode, studioPartType, studioColor, studioMaterial, studioGridSnap]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    bloxAudio.enabled = !next;
  };

  // Select game world to play
  const handlePlayWorld = (worldId: WorldId) => {
    setActiveWorldId(worldId);
    setCurrentMode('playing');
  };

  // Avatar customization save
  const handleSaveAvatar = (newCustom: AvatarCustomization) => {
    setAvatarCustom(newCustom);
    if (engineRef.current) {
      engineRef.current.avatar.updateCustomization(newCustom);
    }
  };

  // Tool equip handler
  const handleSelectTool = (tool: ToolItem | null) => {
    setEquippedTool(tool);
    if (engineRef.current) {
      engineRef.current.equipTool(tool);
    }
  };

  // In-game actions
  const handleResetCharacter = () => {
    engineRef.current?.triggerDeath();
  };

  const handleSendMessage = (text: string) => {
    engineRef.current?.sendChat(text);
  };

  const handleTriggerEmote = (
    emote: 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin'
  ) => {
    engineRef.current?.triggerEmote(emote);
  };

  const activeWorldInfo = WORLDS_DATA.find((w) => w.id === activeWorldId) || WORLDS_DATA[0];

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* GLOBAL TOP NAVIGATION */}
      <TopNav
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        coins={coins}
        username={currentUser.displayName || avatarCustom.username}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onQuickPlay={() => {
          setActiveWorldId('obby');
          setCurrentMode('playing');
        }}
        onOpenAccountModal={() => setShowAccountModal(true)}
        friendsCount={friends.length}
        pendingRequestsCount={incomingRequests.length}
        onOpenFriendsModal={() => setShowFriendsModal(true)}
      />

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* 1. DISCOVER / GAMES BROWSER */}
        {currentMode === 'discover' && (
          <DiscoverHub onPlayWorld={handlePlayWorld} selectedWorld={activeWorldId} />
        )}

        {/* 2. AVATAR CATALOG / MARKETPLACE */}
        {currentMode === 'catalog' && (
          <CatalogShop
            coins={coins}
            onCoinsChange={(c) => {
              setCoins(c);
              if (engineRef.current) engineRef.current.coins = c;
            }}
            avatarCustomization={avatarCustom}
            onUpdateAvatar={handleSaveAvatar}
            inventory={inventory}
            onAddToInventory={handleAddToInventory}
            onOpenAvatarShop={() => setCurrentMode('avatar-editor')}
          />
        )}

        {/* 3. AVATAR EDITOR / SHOP */}
        {currentMode === 'avatar-editor' && (
          <AvatarEditor
            customization={avatarCustom}
            onSave={handleSaveAvatar}
            onClose={() => setCurrentMode('discover')}
          />
        )}

        {/* 4. 3D PLAYING CANVAS & HUD */}
        {currentMode === 'playing' && (
          <div className="relative w-full h-full overflow-hidden bg-slate-950">
            {/* Dedicated empty ref container for Three.js WebGL canvas */}
            <div ref={canvasMountRef} className="w-full h-full block" />

            {/* In-game HUD */}
            <InGameHud
              worldId={activeWorldId}
              worldTitle={activeWorldInfo.title}
              health={health}
              maxHealth={maxHealth}
              stage={stage}
              coins={coins}
              kos={kos}
              wipeouts={wipeouts}
              equippedTool={equippedTool}
              onSelectTool={handleSelectTool}
              onResetCharacter={handleResetCharacter}
              onLeaveGame={() => setCurrentMode('discover')}
              onSendMessage={handleSendMessage}
              onTriggerEmote={handleTriggerEmote}
              chatMessages={chatMessages}
              username={currentUser.displayName || avatarCustom.username}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenFriendsModal={() => setShowFriendsModal(true)}
              onSendFriendRequest={(target) => {
                const res = handleSendFriendRequest(target);
                if (res.success) {
                  bloxAudio.playVictory();
                } else {
                  bloxAudio.playOof();
                }
              }}
              friendUsernames={friends.map((f) => f.username)}
              pendingUsernames={outgoingRequests.map((r) => r.receiverId)}
            />

            {/* Studio Creative Toolbar (when in Studio mode) */}
            {activeWorldId === 'studio' && (
              <StudioToolbar
                toolMode={studioToolMode}
                onChangeToolMode={setStudioToolMode}
                activePartType={studioPartType}
                onChangePartType={setStudioPartType}
                activeColor={studioColor}
                onChangeColor={setStudioColor}
                activeMaterial={studioMaterial}
                onChangeMaterial={setStudioMaterial}
                gridSnap={studioGridSnap}
                onChangeGridSnap={setStudioGridSnap}
                onClearBuild={() => {
                  if (engineRef.current) {
                    engineRef.current.loadWorld('studio');
                  }
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* ACCOUNT CREATION & PROFILE MODAL */}
      {showAccountModal && (
        <AccountModal
          currentUser={currentUser}
          allUsers={allUsers}
          onSelectUser={handleSelectAccount}
          onCreateUser={handleCreateAccount}
          onClose={() => setShowAccountModal(false)}
          coins={coins}
        />
      )}

      {/* FRIENDS & SOCIAL MODAL */}
      {showFriendsModal && (
        <FriendsModal
          isOpen={showFriendsModal}
          onClose={() => setShowFriendsModal(false)}
          currentUser={{
            username: currentUser.username,
            displayName: currentUser.displayName || avatarCustom.username,
          }}
          friends={friends}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
          onSendFriendRequest={handleSendFriendRequest}
          onRemoveFriend={handleRemoveFriend}
          onJoinGame={handleJoinFriendGame}
        />
      )}
    </div>
  );
}
