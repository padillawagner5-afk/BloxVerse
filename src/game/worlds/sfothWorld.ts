import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';
import { TargetBot } from './crossroadsWorld';
import { WorldCollider } from './obbyWorld';

export function buildSfothWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  bots: TargetBot[];
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const bots: TargetBot[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 4, 0);

  // Materials
  const stoneMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      map: studTex,
      roughness: 0.6,
      metalness: 0.1,
    });

  // 1. CENTER SPAWN ISLAND
  const centerGeo = new THREE.CylinderGeometry(14, 18, 4, 24);
  const centerIsland = new THREE.Mesh(centerGeo, stoneMat(0x64748b));
  centerIsland.position.set(0, 2, 0);
  centerIsland.receiveShadow = true;
  sceneGroup.add(centerIsland);
  colliders.push({ box: new THREE.Box3().setFromObject(centerIsland), type: 'solid', mesh: centerIsland });

  // Center Obelisk Altar
  const obelisk = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 3), stoneMat(0x1e293b));
  obelisk.position.set(0, 9, 0);
  obelisk.castShadow = true;
  sceneGroup.add(obelisk);
  colliders.push({ box: new THREE.Box3().setFromObject(obelisk), type: 'solid', mesh: obelisk });

  // Floating Glowing Sacred Sword on top of obelisk
  const swordGlow = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.2),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    })
  );
  swordGlow.position.set(0, 17, 0);
  sceneGroup.add(swordGlow);

  // 2. SURROUNDING SKY ISLANDS (4 directions: North, South, East, West)
  const islandOffsets = [
    { x: 0, z: -34, y: 6, col: 0x475569, name: 'Venom Island' },
    { x: 34, z: 0, y: 10, col: 0x334155, name: 'Illumina Peak' },
    { x: 0, z: 34, y: 4, col: 0x475569, name: 'Darkheart Crypt' },
    { x: -34, z: 0, y: 8, col: 0x1e293b, name: 'Windforce Ridge' },
  ];

  islandOffsets.forEach((is) => {
    const isMesh = new THREE.Mesh(new THREE.CylinderGeometry(10, 14, 4, 20), stoneMat(is.col));
    isMesh.position.set(is.x, is.y, is.z);
    isMesh.receiveShadow = true;
    sceneGroup.add(isMesh);
    colliders.push({ box: new THREE.Box3().setFromObject(isMesh), type: 'solid', mesh: isMesh });

    // Narrow Stone Bridge connecting to center
    const bridgeGeo = new THREE.BoxGeometry(3, 0.6, 22);
    const bridge = new THREE.Mesh(bridgeGeo, stoneMat(0x94a3b8));
    bridge.position.set(is.x * 0.5, (is.y + 2) * 0.5, is.z * 0.5);
    bridge.lookAt(new THREE.Vector3(0, 2, 0));
    bridge.receiveShadow = true;
    sceneGroup.add(bridge);
    colliders.push({ box: new THREE.Box3().setFromObject(bridge), type: 'solid', mesh: bridge });
  });

  // 3. BOT DUELISTS ROAMING THE PEAKS
  const sfothBots = [
    { name: 'SwordMaster_Rex', pos: new THREE.Vector3(0, 8, -34), color: 0x22c55e },
    { name: 'Illumina_Duelist', pos: new THREE.Vector3(34, 12, 0), color: 0x38bdf8 },
    { name: 'Darkheart_Assassin', pos: new THREE.Vector3(0, 6, 34), color: 0xdc2626 },
  ];

  sfothBots.forEach((b, idx) => {
    const botGroup = new THREE.Group();
    botGroup.position.copy(b.pos);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    head.position.set(0, 4.1, 0);
    botGroup.add(head);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), new THREE.MeshStandardMaterial({ color: b.color }));
    torso.position.set(0, 3, 0);
    botGroup.add(torso);

    // Limbs
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: b.color }));
    leftArm.position.set(-1.5, 3, 0);
    botGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: b.color }));
    rightArm.position.set(1.5, 3, 0);
    botGroup.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    leftLeg.position.set(-0.5, 1, 0);
    botGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    rightLeg.position.set(0.5, 1, 0);
    botGroup.add(rightLeg);

    sceneGroup.add(botGroup);

    bots.push({
      id: `sfoth_bot_${idx}`,
      name: b.name,
      group: botGroup,
      health: 120,
      maxHealth: 120,
      position: b.pos.clone(),
      velocity: new THREE.Vector3(),
      targetPos: b.pos.clone(),
      isDead: false,
      respawnTime: 0,
      type: 'knight',
    });
  });

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    bots,
  };
}
