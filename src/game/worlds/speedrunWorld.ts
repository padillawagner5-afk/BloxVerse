import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';
import { WorldCollider } from './obbyWorld';

export function buildSpeedrunWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  checkpoints: THREE.Vector3[];
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const checkpoints: THREE.Vector3[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 3, 0);
  checkpoints.push(spawnPoint.clone());

  // Materials
  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    map: studTex,
    roughness: 0.3,
    metalness: 0.2,
  });

  const neonMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

  // 1. START PLATFORM
  const startGeo = new THREE.BoxGeometry(18, 2, 18);
  const startPad = new THREE.Mesh(startGeo, trackMat);
  startPad.position.set(0, 1, 0);
  startPad.receiveShadow = true;
  sceneGroup.add(startPad);
  colliders.push({ box: new THREE.Box3().setFromObject(startPad), type: 'solid', mesh: startPad });

  // 2. LONG HIGH-SPEED RUNWAY WITH NEON LIGHT RINGS
  let curZ = 10;
  let curY = 1;
  const colors = [0x06b6d4, 0x3b82f6, 0xa855f7, 0xec4899, 0xf59e0b, 0x22c55e];

  for (let seg = 0; seg < 8; seg++) {
    const segLen = 28;
    const segWidth = 8 - Math.min(3, seg * 0.4); // Gets narrower!
    const track = new THREE.Mesh(new THREE.BoxGeometry(segWidth, 1.4, segLen), trackMat);
    track.position.set(0, curY, curZ + segLen / 2);
    track.receiveShadow = true;
    sceneGroup.add(track);
    colliders.push({ box: new THREE.Box3().setFromObject(track), type: 'solid', mesh: track });

    // Neon side rails
    const railColor = colors[seg % colors.length];
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, segLen), neonMat(railColor));
    leftRail.position.set(-segWidth / 2, curY + 0.6, curZ + segLen / 2);
    sceneGroup.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, segLen), neonMat(railColor));
    rightRail.position.set(segWidth / 2, curY + 0.6, curZ + segLen / 2);
    sceneGroup.add(rightRail);

    // Glowing Neon Speed Ring Gate
    const ringGeo = new THREE.TorusGeometry(segWidth * 0.7, 0.35, 12, 24);
    const ring = new THREE.Mesh(ringGeo, neonMat(railColor));
    ring.position.set(0, curY + segWidth * 0.7, curZ + segLen / 2);
    sceneGroup.add(ring);

    // Speed booster pad on floor
    const padGeo = new THREE.BoxGeometry(segWidth * 0.8, 0.2, 4);
    const pad = new THREE.Mesh(padGeo, neonMat(0xfacc15));
    pad.position.set(0, curY + 0.8, curZ + 8);
    sceneGroup.add(pad);
    colliders.push({ box: new THREE.Box3().setFromObject(pad), type: 'speedpad', mesh: pad });

    // Checkpoint at segment 4
    if (seg === 3) {
      const cpPos = new THREE.Vector3(0, curY + 2, curZ + segLen / 2);
      checkpoints.push(cpPos);
      colliders.push({
        box: new THREE.Box3().setFromCenterAndSize(cpPos, new THREE.Vector3(8, 6, 8)),
        type: 'checkpoint',
        checkpointIndex: 1,
      });
    }

    curZ += segLen + (seg % 2 === 1 ? 6 : 0); // Jumps between segments!
    curY += seg * 0.5;
  }

  // 3. FINAL WINNERS FINISH LINE & PYRAMID
  curZ += 8;
  const finishGeo = new THREE.BoxGeometry(24, 2, 24);
  const finishPad = new THREE.Mesh(finishGeo, trackMat);
  finishPad.position.set(0, curY, curZ + 12);
  sceneGroup.add(finishPad);
  colliders.push({ box: new THREE.Box3().setFromObject(finishPad), type: 'solid', mesh: finishPad });

  // Neon Victory Arch
  const arch = new THREE.Mesh(new THREE.TorusGeometry(8, 0.6, 16, 32), neonMat(0x22c55e));
  arch.position.set(0, curY + 8, curZ + 12);
  sceneGroup.add(arch);

  colliders.push({
    box: new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(0, curY + 3, curZ + 12),
      new THREE.Vector3(16, 8, 16)
    ),
    type: 'winner',
  });

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    checkpoints,
  };
}
