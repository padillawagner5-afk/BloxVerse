import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';
import { WorldCollider } from './obbyWorld';

export interface TargetBot {
  id: string;
  name: string;
  group: THREE.Group;
  health: number;
  maxHealth: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  isDead: boolean;
  respawnTime: number;
  type: 'noob' | 'guest' | 'knight';
}

export function buildCrossroadsWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  bots: TargetBot[];
  trampolines: THREE.Box3[];
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const trampolines: THREE.Box3[] = [];
  const bots: TargetBot[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 2, 20);

  // Materials
  const stoneMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      map: studTex,
      roughness: 0.65,
      metalness: 0.05,
    });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.8,
    metalness: 0.05,
  });

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Classic green grass
    map: studTex,
    roughness: 0.5,
  });

  // 1. MAIN CRAGGY GROUND PLATE (64 x 64 studs)
  const groundGeo = new THREE.BoxGeometry(90, 4, 90);
  const ground = new THREE.Mesh(groundGeo, grassMat);
  ground.position.set(0, -2, 0);
  ground.receiveShadow = true;
  sceneGroup.add(ground);
  colliders.push({ box: new THREE.Box3().setFromObject(ground), type: 'solid', mesh: ground });

  // Natural rock boulders around perimeter
  const rockColors = [0x64748b, 0x475569, 0x334155];
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 40 + Math.sin(i * 3) * 4;
    const rx = Math.cos(angle) * dist;
    const rz = Math.sin(angle) * dist;
    const rSize = 4 + Math.sin(i * 5) * 2;

    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rSize), stoneMat(rockColors[i % 3]));
    rock.position.set(rx, rSize * 0.4, rz);
    rock.rotation.set(i * 0.5, i * 0.7, 0);
    rock.castShadow = true;
    rock.receiveShadow = true;
    sceneGroup.add(rock);
    colliders.push({ box: new THREE.Box3().setFromObject(rock), type: 'solid', mesh: rock });
  }

  // 2. CENTER CASTLE TOWER
  const castleBase = new THREE.Mesh(new THREE.BoxGeometry(20, 16, 20), stoneMat(0x475569));
  castleBase.position.set(0, 8, 0);
  castleBase.castShadow = true;
  castleBase.receiveShadow = true;
  sceneGroup.add(castleBase);
  colliders.push({ box: new THREE.Box3().setFromObject(castleBase), type: 'solid', mesh: castleBase });

  // Castle Entrance Archway (hollow interior)
  const crenellationMat = stoneMat(0x334155);
  // Battlements on top of castle
  for (let b = 0; b < 4; b++) {
    const cren = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 2), crenellationMat);
    if (b === 0) cren.position.set(-8, 17, -9);
    if (b === 1) cren.position.set(8, 17, -9);
    if (b === 2) cren.position.set(-8, 17, 9);
    if (b === 3) cren.position.set(8, 17, 9);
    sceneGroup.add(cren);
  }

  // Lookout Center Turret
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 12, 16), stoneMat(0x64748b));
  turret.position.set(0, 22, 0);
  turret.castShadow = true;
  sceneGroup.add(turret);
  colliders.push({ box: new THREE.Box3().setFromObject(turret), type: 'solid', mesh: turret });

  // Castle Roof Top Platform
  const turretRoof = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 1, 16), crenellationMat);
  turretRoof.position.set(0, 28, 0);
  sceneGroup.add(turretRoof);
  colliders.push({ box: new THREE.Box3().setFromObject(turretRoof), type: 'solid', mesh: turretRoof });

  // Truss Climbing Ladders on castle sides
  const trussMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red classic truss
    roughness: 0.3,
  });
  const truss = new THREE.Mesh(new THREE.BoxGeometry(2, 28, 0.4), trussMat);
  truss.position.set(0, 14, 10.2);
  sceneGroup.add(truss);
  // Add stepping collision
  colliders.push({ box: new THREE.Box3().setFromObject(truss), type: 'solid', mesh: truss });

  // 3. WEST CLIFF & SUSPENSION BRIDGE
  const westCliff = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 16), stoneMat(0x334155));
  westCliff.position.set(-28, 6, -10);
  westCliff.castShadow = true;
  sceneGroup.add(westCliff);
  colliders.push({ box: new THREE.Box3().setFromObject(westCliff), type: 'solid', mesh: westCliff });

  // Wooden Bridge linking West Cliff to Castle Top
  const bridgeGeo = new THREE.BoxGeometry(20, 0.8, 4);
  const bridge = new THREE.Mesh(bridgeGeo, woodMat);
  bridge.position.set(-14, 12, -5);
  bridge.rotation.z = -0.15;
  bridge.castShadow = true;
  sceneGroup.add(bridge);
  colliders.push({ box: new THREE.Box3().setFromObject(bridge), type: 'solid', mesh: bridge });

  // 4. EAST CLIFF & SECOND TOWER
  const eastCliff = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 16), stoneMat(0x475569));
  eastCliff.position.set(28, 5, 10);
  eastCliff.castShadow = true;
  sceneGroup.add(eastCliff);
  colliders.push({ box: new THREE.Box3().setFromObject(eastCliff), type: 'solid', mesh: eastCliff });

  // 5. TRAMPOLINE JUMP PADS (Super High Launch!)
  const trampPositions = [
    new THREE.Vector3(-14, 0.5, 18),
    new THREE.Vector3(14, 0.5, -18),
    new THREE.Vector3(-28, 12.4, -10),
  ];

  trampPositions.forEach((pos) => {
    // Metal frame
    const frame = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.6, 20),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
    );
    frame.position.copy(pos);
    sceneGroup.add(frame);

    // Neon spring canvas
    const springCanvas = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.3, 20),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfacc15,
        emissiveIntensity: 0.5,
      })
    );
    springCanvas.position.set(pos.x, pos.y + 0.3, pos.z);
    sceneGroup.add(springCanvas);

    const trampBox = new THREE.Box3().setFromObject(springCanvas);
    trampolines.push(trampBox);
    colliders.push({ box: trampBox, type: 'jumppad', mesh: springCanvas });
  });

  // 6. TARGET BOTS & DUMMIES
  const botConfigs: { name: string; type: 'noob' | 'knight' | 'guest'; pos: THREE.Vector3 }[] = [
    { name: 'Classic Noob', type: 'noob', pos: new THREE.Vector3(10, 0, 8) },
    { name: 'Red Cliff Knight', type: 'knight', pos: new THREE.Vector3(-26, 12, -10) },
    { name: 'Guest 1337', type: 'guest', pos: new THREE.Vector3(-12, 0, -14) },
    { name: 'Tower Guard', type: 'knight', pos: new THREE.Vector3(0, 16, 0) },
  ];

  botConfigs.forEach((cfg, idx) => {
    const botGroup = new THREE.Group();
    botGroup.position.copy(cfg.pos);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.MeshStandardMaterial({
        color: cfg.type === 'guest' ? 0xffffff : 0xfacc15,
        roughness: 0.4,
      })
    );
    head.position.set(0, 4.1, 0);
    botGroup.add(head);

    // Torso
    const torsoColor = cfg.type === 'knight' ? 0x475569 : cfg.type === 'guest' ? 0x111827 : 0x0284c7;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), new THREE.MeshStandardMaterial({ color: torsoColor }));
    torso.position.set(0, 3, 0);
    botGroup.add(torso);

    // Limbs
    const armColor = cfg.type === 'noob' ? 0xfacc15 : torsoColor;
    const legColor = cfg.type === 'noob' ? 0x22c55e : 0x1e293b;
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: armColor }));
    leftArm.position.set(-1.5, 3, 0);
    botGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: armColor }));
    rightArm.position.set(1.5, 3, 0);
    botGroup.add(rightArm);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: legColor }));
    leftLeg.position.set(-0.5, 1, 0);
    botGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: legColor }));
    rightLeg.position.set(0.5, 1, 0);
    botGroup.add(rightLeg);

    sceneGroup.add(botGroup);

    bots.push({
      id: `bot_${idx}`,
      name: cfg.name,
      group: botGroup,
      health: 100,
      maxHealth: 100,
      position: cfg.pos.clone(),
      velocity: new THREE.Vector3(),
      targetPos: cfg.pos.clone(),
      isDead: false,
      respawnTime: 0,
      type: cfg.type,
    });
  });

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    bots,
    trampolines,
  };
}
