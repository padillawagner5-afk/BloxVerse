import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';

export interface WorldCollider {
  box: THREE.Box3;
  type: 'solid' | 'lava' | 'checkpoint' | 'jumppad' | 'speedpad' | 'winner';
  checkpointIndex?: number;
  mesh?: THREE.Object3D;
  customData?: any;
}

export interface DynamicObstacle {
  mesh: THREE.Object3D;
  update: (delta: number, elapsed: number) => void;
  getCollider: () => THREE.Box3;
  type: 'lava' | 'solid';
}

export function buildObbyWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  checkpointPositions: THREE.Vector3[];
  dynamicObstacles: DynamicObstacle[];
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const dynamicObstacles: DynamicObstacle[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 3, 0);
  const checkpointPositions: THREE.Vector3[] = [spawnPoint.clone()];

  // Materials
  const plasticMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      map: studTex,
      roughness: 0.35,
      metalness: 0.05,
    });

  const neonMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

  // Base Spawning Platform (Stage 0)
  const spawnPadGeo = new THREE.BoxGeometry(16, 2, 16);
  const spawnPad = new THREE.Mesh(spawnPadGeo, plasticMat(0x1e293b));
  spawnPad.position.set(0, 1, 0);
  spawnPad.receiveShadow = true;
  sceneGroup.add(spawnPad);

  // Decorative spawn ring
  const ringGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.2, 32);
  const ring = new THREE.Mesh(ringGeo, neonMat(0x38bdf8));
  ring.position.set(0, 2.1, 0);
  sceneGroup.add(ring);

  const spawnBox = new THREE.Box3().setFromObject(spawnPad);
  colliders.push({ box: spawnBox, type: 'solid', mesh: spawnPad });

  // STAGE 1: RAINBOW STEP PLATFORMS
  const rainbowColors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x06b6d4, 0x3b82f6, 0xa855f7];
  let curZ = 12;
  let curY = 2;

  rainbowColors.forEach((color, idx) => {
    const stepGeo = new THREE.BoxGeometry(5, 1.2, 5);
    const step = new THREE.Mesh(stepGeo, plasticMat(color));
    const stepX = Math.sin(idx * 1.1) * 3.5;
    curZ += 8;
    curY += 1.2;
    step.position.set(stepX, curY, curZ);
    step.castShadow = true;
    step.receiveShadow = true;
    sceneGroup.add(step);

    const box = new THREE.Box3().setFromObject(step);
    colliders.push({ box, type: 'solid', mesh: step });
  });

  // CHECKPOINT 1 PLATFORM
  curZ += 8;
  curY += 1;
  const cp1Geo = new THREE.BoxGeometry(10, 1.5, 10);
  const cp1 = new THREE.Mesh(cp1Geo, plasticMat(0x0f172a));
  cp1.position.set(0, curY, curZ);
  sceneGroup.add(cp1);
  colliders.push({ box: new THREE.Box3().setFromObject(cp1), type: 'solid', mesh: cp1 });

  const cp1DecalGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 24);
  const cp1Decal = new THREE.Mesh(cp1DecalGeo, neonMat(0x10b981));
  cp1Decal.position.set(0, curY + 0.8, curZ);
  sceneGroup.add(cp1Decal);

  const cp1Pos = new THREE.Vector3(0, curY + 2.5, curZ);
  checkpointPositions.push(cp1Pos);
  colliders.push({
    box: new THREE.Box3().setFromCenterAndSize(cp1Pos, new THREE.Vector3(6, 4, 6)),
    type: 'checkpoint',
    checkpointIndex: 1,
  });

  // STAGE 2: LAVA STRIPS (RED KILL BRICKS)
  curZ += 8;
  const floorWidth = 6;
  const lavaSectionLen = 48;
  const lavaFloorGeo = new THREE.BoxGeometry(floorWidth, 1.2, lavaSectionLen);
  const lavaFloor = new THREE.Mesh(lavaFloorGeo, plasticMat(0x334155));
  lavaFloor.position.set(0, curY, curZ + lavaSectionLen / 2);
  sceneGroup.add(lavaFloor);
  colliders.push({ box: new THREE.Box3().setFromObject(lavaFloor), type: 'solid', mesh: lavaFloor });

  // Neon Red Lava Kill-Bricks placed across the runway
  for (let lz = 8; lz < lavaSectionLen - 6; lz += 8) {
    const lavaGeo = new THREE.BoxGeometry(floorWidth - 0.2, 0.8, 2.4);
    const lava = new THREE.Mesh(lavaGeo, neonMat(0xef4444));
    lava.position.set(0, curY + 0.9, curZ + lz);
    sceneGroup.add(lava);

    const lavaBox = new THREE.Box3().setFromObject(lava);
    colliders.push({ box: lavaBox, type: 'lava', mesh: lava });
  }

  curZ += lavaSectionLen + 6;

  // CHECKPOINT 2
  const cp2Geo = new THREE.BoxGeometry(10, 1.5, 10);
  const cp2 = new THREE.Mesh(cp2Geo, plasticMat(0x0f172a));
  cp2.position.set(0, curY, curZ);
  sceneGroup.add(cp2);
  colliders.push({ box: new THREE.Box3().setFromObject(cp2), type: 'solid', mesh: cp2 });

  const cp2Decal = new THREE.Mesh(cp1DecalGeo, neonMat(0x10b981));
  cp2Decal.position.set(0, curY + 0.8, curZ);
  sceneGroup.add(cp2Decal);

  const cp2Pos = new THREE.Vector3(0, curY + 2.5, curZ);
  checkpointPositions.push(cp2Pos);
  colliders.push({
    box: new THREE.Box3().setFromCenterAndSize(cp2Pos, new THREE.Vector3(6, 4, 6)),
    type: 'checkpoint',
    checkpointIndex: 2,
  });

  // STAGE 3: SPINNING LAVA SPINNER BEAMS
  curZ += 8;
  for (let s = 0; s < 3; s++) {
    const islandGeo = new THREE.CylinderGeometry(3.5, 3.5, 1.5, 16);
    const island = new THREE.Mesh(islandGeo, plasticMat(0x475569));
    island.position.set(0, curY, curZ + s * 16);
    sceneGroup.add(island);
    colliders.push({ box: new THREE.Box3().setFromObject(island), type: 'solid', mesh: island });

    // Rotating Lava Bar
    const spinnerGroup = new THREE.Group();
    spinnerGroup.position.set(0, curY + 1.2, curZ + s * 16);

    const pivotGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12);
    const pivot = new THREE.Mesh(pivotGeo, plasticMat(0x1e293b));
    spinnerGroup.add(pivot);

    const barGeo = new THREE.BoxGeometry(6.8, 0.6, 0.6);
    const bar = new THREE.Mesh(barGeo, neonMat(0xdc2626));
    bar.position.set(0, 0.4, 0);
    spinnerGroup.add(bar);

    sceneGroup.add(spinnerGroup);

    const spinSpeed = 1.4 * (s % 2 === 0 ? 1 : -1);
    const barBox = new THREE.Box3();

    dynamicObstacles.push({
      mesh: spinnerGroup,
      type: 'lava',
      update: (delta) => {
        spinnerGroup.rotation.y += spinSpeed * delta;
      },
      getCollider: () => {
        barBox.setFromObject(bar);
        return barBox;
      },
    });
  }

  curZ += 3 * 16 + 6;

  // CHECKPOINT 3
  const cp3Geo = new THREE.BoxGeometry(10, 1.5, 10);
  const cp3 = new THREE.Mesh(cp3Geo, plasticMat(0x0f172a));
  cp3.position.set(0, curY, curZ);
  sceneGroup.add(cp3);
  colliders.push({ box: new THREE.Box3().setFromObject(cp3), type: 'solid', mesh: cp3 });

  const cp3Decal = new THREE.Mesh(cp1DecalGeo, neonMat(0x10b981));
  cp3Decal.position.set(0, curY + 0.8, curZ);
  sceneGroup.add(cp3Decal);

  const cp3Pos = new THREE.Vector3(0, curY + 2.5, curZ);
  checkpointPositions.push(cp3Pos);
  colliders.push({
    box: new THREE.Box3().setFromCenterAndSize(cp3Pos, new THREE.Vector3(6, 4, 6)),
    type: 'checkpoint',
    checkpointIndex: 3,
  });

  // STAGE 4: DISAPPEARING GLASS BRIDGE & SPEED PAD
  curZ += 8;
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
  });

  // Pairs of glass panels (one real, one fake that doesn't collide)
  const bridgePairs = 5;
  for (let p = 0; p < bridgePairs; p++) {
    const safeLeft = p % 2 === 0;
    const zPos = curZ + p * 6;

    // Left glass
    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 4), glassMat);
    leftGlass.position.set(-2, curY, zPos);
    sceneGroup.add(leftGlass);

    // Right glass
    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 4), glassMat);
    rightGlass.position.set(2, curY, zPos);
    sceneGroup.add(rightGlass);

    if (safeLeft) {
      colliders.push({ box: new THREE.Box3().setFromObject(leftGlass), type: 'solid', mesh: leftGlass });
    } else {
      colliders.push({ box: new THREE.Box3().setFromObject(rightGlass), type: 'solid', mesh: rightGlass });
    }
  }

  curZ += bridgePairs * 6 + 6;

  // JUMP PAD TO FINAL WINNERS ISLAND
  const padGeo = new THREE.BoxGeometry(6, 1.2, 6);
  const pad = new THREE.Mesh(padGeo, plasticMat(0x0f172a));
  pad.position.set(0, curY, curZ);
  sceneGroup.add(pad);
  colliders.push({ box: new THREE.Box3().setFromObject(pad), type: 'solid', mesh: pad });

  // Neon yellow jump launcher pad
  const jumpDecal = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.3, 16), neonMat(0xfacc15));
  jumpDecal.position.set(0, curY + 0.7, curZ);
  sceneGroup.add(jumpDecal);
  colliders.push({
    box: new THREE.Box3().setFromObject(jumpDecal),
    type: 'jumppad',
    mesh: jumpDecal,
  });

  // STAGE 5 / WINNERS LOUNGE ISLAND!
  curZ += 32;
  curY += 12;

  const winnerIslandGeo = new THREE.CylinderGeometry(22, 24, 4, 32);
  const winnerIsland = new THREE.Mesh(winnerIslandGeo, plasticMat(0x16a34a)); // Lush victory grass
  winnerIsland.position.set(0, curY, curZ);
  winnerIsland.receiveShadow = true;
  sceneGroup.add(winnerIsland);
  colliders.push({ box: new THREE.Box3().setFromObject(winnerIsland), type: 'solid', mesh: winnerIsland });

  // Giant Golden Bloxy Trophy
  const trophyBase = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3.5, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  trophyBase.position.set(0, curY + 2.8, curZ);
  sceneGroup.add(trophyBase);

  const trophyGoldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.15,
  });
  const trophyCup = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.2, 3.5, 16), trophyGoldMat);
  trophyCup.position.set(0, curY + 5.2, curZ);
  trophyCup.castShadow = true;
  sceneGroup.add(trophyCup);

  // Winner trigger box
  const winnerPos = new THREE.Vector3(0, curY + 2, curZ);
  colliders.push({
    box: new THREE.Box3().setFromCenterAndSize(winnerPos, new THREE.Vector3(20, 8, 20)),
    type: 'winner',
  });

  // Decorative Victory Trees & Rainbow arches on winners island
  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI * 2;
    const tx = Math.cos(angle) * 14;
    const tz = curZ + Math.sin(angle) * 14;

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 4, 8), plasticMat(0x78350f));
    trunk.position.set(tx, curY + 4, tz);
    sceneGroup.add(trunk);

    const foliage = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), plasticMat(0x15803d));
    foliage.position.set(tx, curY + 7, tz);
    foliage.castShadow = true;
    sceneGroup.add(foliage);
  }

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    checkpointPositions,
    dynamicObstacles,
  };
}
