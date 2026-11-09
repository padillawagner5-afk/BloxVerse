import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AvatarCustomization } from '../types/blox';
import { BloxAvatar } from '../game/Avatar';
import { bloxAudio } from '../audio/soundEffects';
import { Check, Sparkles, RotateCw, User, Shirt, Smile, Shield } from 'lucide-react';

interface AvatarEditorProps {
  customization: AvatarCustomization;
  onSave: (customization: AvatarCustomization) => void;
  onClose: () => void;
}

const ROBLOX_BODY_COLORS = [
  { name: 'Bright Yellow', hex: '#facc15' },
  { name: 'Bright Blue', hex: '#0284c7' },
  { name: 'Bright Green', hex: '#22c55e' },
  { name: 'Bright Red', hex: '#ef4444' },
  { name: 'Medium Stone Grey', hex: '#64748b' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Black', hex: '#0f172a' },
  { name: 'Dark Stone Grey', hex: '#334155' },
  { name: 'Neon Orange', hex: '#ea580c' },
  { name: 'Royal Purple', hex: '#a855f7' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Tan Skin', hex: '#f5d0a9' },
  { name: 'Dark Brown', hex: '#78350f' },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ customization, onSave, onClose }) => {
  const [current, setCurrent] = useState<AvatarCustomization>({ ...customization });
  const [activeTab, setActiveTab] = useState<'colors' | 'hats' | 'faces' | 'shirts' | 'profile'>('colors');
  const [selectedLimb, setSelectedLimb] = useState<
    'all' | 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'
  >('all');
  const [testAnim, setTestAnim] = useState<
    'idle' | 'walk' | 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin'
  >('idle');

  const mountRef = useRef<HTMLDivElement>(null);
  const avatarInstanceRef = useRef<BloxAvatar | null>(null);

  const handleSelectAnim = (anim: 'idle' | 'walk' | 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin') => {
    setTestAnim(anim);
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.setPreviewAnimation(anim);
      if (anim === 'flip') bloxAudio.playJump();
      else if (anim === 'dance') bloxAudio.playVictory();
      else if (anim === 'walk') bloxAudio.playCoin();
      else bloxAudio.playPlaceBrick();
    }
  };

  // 3D Turntable Preview
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 9);
    camera.lookAt(0, 3.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.replaceChildren(renderer.domElement);

    // Studio lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 1.0);
    scene.add(hemiLight);

    // Floor pedestal
    const pedestalGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.2, 0);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Avatar
    const avatar = new BloxAvatar(current);
    scene.add(avatar.root);
    avatarInstanceRef.current = avatar;

    let frameId = 0;
    let rotation = 0;
    let isDragging = false;
    let lastX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        rotation += dx * 0.015;
      }
    };
    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isDragging) {
        rotation += 0.005; // Gentle auto-turntable
      }
      avatar.root.rotation.y = rotation;
      avatar.update(0.016, false, 0, true, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      avatar.dispose();
      renderer.dispose();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Update 3D avatar when customization changes
  useEffect(() => {
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.updateCustomization(current);
    }
  }, [current]);

  const handleColorPick = (hex: string) => {
    bloxAudio.playPlaceBrick();
    if (selectedLimb === 'all') {
      setCurrent((prev) => ({
        ...prev,
        headColor: hex,
        torsoColor: hex,
        leftArmColor: hex,
        rightArmColor: hex,
        leftLegColor: hex,
        rightLegColor: hex,
      }));
    } else if (selectedLimb === 'head') {
      setCurrent((prev) => ({ ...prev, headColor: hex }));
    } else if (selectedLimb === 'torso') {
      setCurrent((prev) => ({ ...prev, torsoColor: hex }));
    } else if (selectedLimb === 'leftArm') {
      setCurrent((prev) => ({ ...prev, leftArmColor: hex }));
    } else if (selectedLimb === 'rightArm') {
      setCurrent((prev) => ({ ...prev, rightArmColor: hex }));
    } else if (selectedLimb === 'leftLeg') {
      setCurrent((prev) => ({ ...prev, leftLegColor: hex }));
    } else if (selectedLimb === 'rightLeg') {
      setCurrent((prev) => ({ ...prev, rightLegColor: hex }));
    }
  };

  const hatsList: { id: AvatarCustomization['hat']; name: string; icon: string }[] = [
    { id: 'fedora', name: 'Sparkle Time Fedora', icon: '🎩' },
    { id: 'dominus', name: 'Dominus Shroud', icon: '👑' },
    { id: 'valkyrie', name: 'Valkyrie Helm', icon: '🪶' },
    { id: 'crown', name: "King's Crown", icon: '💎' },
    { id: 'antlers', name: 'Golden Antlers', icon: '🦌' },
    { id: 'tophat', name: 'Top Hat', icon: '🎩' },
    { id: 'visor', name: 'Classic Red Visor', icon: '🔴' },
    { id: 'chef', name: 'Master Chef Hat', icon: '🧑‍🍳' },
    { id: 'baconhair', name: 'Classic Bacon Hair', icon: '💇' },
    { id: 'none', name: 'No Hat', icon: '🚫' },
  ];

  const facesList: { id: AvatarCustomization['face']; name: string; preview: string }[] = [
    { id: 'smile', name: 'Classic Smile', preview: '🙂' },
    { id: 'chill', name: 'Chill Face', preview: '😎' },
    { id: 'epic', name: 'Epic Meme Face', preview: '😀' },
    { id: 'winning', name: 'Winning Smile', preview: '😄' },
    { id: 'beast', name: 'Beast Snarl', preview: '👹' },
    { id: 'joy', name: 'Joyful Blush', preview: '🥰' },
    { id: 'cyborg', name: 'Cyborg Tactical', preview: '🤖' },
  ];

  const shirtsList: { id: AvatarCustomization['shirt']; name: string; desc: string }[] = [
    { id: 'hoodie', name: 'Midnight Streetwear Hoodie', desc: 'Black oversized hoodie' },
    { id: 'galaxy', name: 'Nebula Galaxy Tee', desc: 'Deep cosmic star gradient' },
    { id: 'noob', name: 'Classic Noob Blue', desc: 'The legendary bright blue & yellow' },
    { id: 'classic', name: 'Roblox "R" Logo Tee', desc: 'Classic black t-shirt with tilted red R' },
    { id: 'tuxedo', name: 'Black Tuxedo & Bowtie', desc: 'Fancy evening attire' },
    { id: 'builder', name: 'Blox Builder Harness', desc: 'Safety overalls with wrench' },
    { id: 'stripes', name: 'Retro 2007 Stripes', desc: 'Green & white stripe vintage tee' },
  ];

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden select-none">
      {/* LEFT: 3D Turntable Avatar Viewport */}
      <div className="w-full md:w-1/2 h-80 md:h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Click & Drag to Rotate</span>
        </div>

        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Emote & Animation Preview Bar */}
        <div className="absolute bottom-3 inset-x-3 z-10 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-1.5 shadow-2xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Avatar Animations</span>
            </span>
            <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              {testAnim}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'idle', label: '🧍 Idle' },
              { id: 'walk', label: '🚶 Walk' },
              { id: 'dance', label: '🕺 Dance' },
              { id: 'flip', label: '🤸 Flip' },
              { id: 'spin', label: '🌀 Spin' },
              { id: 'wave', label: '👋 Wave' },
              { id: 'cheer', label: '🙌 Cheer' },
              { id: 'point', label: '👉 Point' },
            ].map((em) => (
              <button
                key={em.id}
                onClick={() => handleSelectAnim(em.id as any)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  testAnim === em.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {em.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Customization Controls */}
      <div className="w-full md:w-1/2 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-800 p-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'colors' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Skin & Limbs</span>
          </button>

          <button
            onClick={() => setActiveTab('hats')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'hats' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hats</span>
          </button>

          <button
            onClick={() => setActiveTab('faces')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'faces' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Faces</span>
          </button>

          <button
            onClick={() => setActiveTab('shirts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'shirts' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Shirts</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: BODY COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Body Part:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { id: 'all', label: 'All Limbs' },
                    { id: 'head', label: 'Head' },
                    { id: 'torso', label: 'Torso' },
                    { id: 'leftArm', label: 'Left Arm' },
                    { id: 'rightArm', label: 'Right Arm' },
                    { id: 'leftLeg', label: 'Left Leg' },
                    { id: 'rightLeg', label: 'Right Leg' },
                  ].map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setSelectedLimb(part.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedLimb === part.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Palette:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 mt-2">
                  {ROBLOX_BODY_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => handleColorPick(col.hex)}
                      className="h-12 rounded-xl border border-white/10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow"
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HATS */}
          {activeTab === 'hats' && (
            <div className="grid grid-cols-2 gap-3">
              {hatsList.map((hat) => {
                const isActive = current.hat === hat.id;
                return (
                  <button
                    key={hat.id}
                    onClick={() => {
                      bloxAudio.playPlaceBrick();
                      setCurrent((p) => ({ ...p, hat: hat.id }));
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-red-950/40 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{hat.icon}</span>
                    <span className="text-xs font-bold">{hat.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: FACES */}
          {activeTab === 'faces' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facesList.map((f) => {
                const isActive = current.face === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      bloxAudio.playPlaceBrick();
                      setCurrent((p) => ({ ...p, face: f.id }));
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-red-950/40 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-3xl">{f.preview}</span>
                    <span className="text-xs font-bold">{f.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 4: SHIRTS */}
          {activeTab === 'shirts' && (
            <div className="space-y-2.5">
              {shirtsList.map((shirt) => {
                const isActive = current.shirt === shirt.id;
                return (
                  <button
                    key={shirt.id}
                    onClick={() => {
                      bloxAudio.playPlaceBrick();
                      setCurrent((p) => ({ ...p, shirt: shirt.id }));
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-red-950/40 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{shirt.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{shirt.desc}</div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Save Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Player Tag:</span>
            <input
              type="text"
              value={current.username}
              onChange={(e) => setCurrent((p) => ({ ...p, username: e.target.value }))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold max-w-[120px]"
              maxLength={15}
            />
          </div>

          <button
            onClick={() => {
              bloxAudio.playVictory();
              onSave(current);
              onClose();
            }}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Save & Equip
          </button>
        </div>
      </div>
    </div>
  );
};
