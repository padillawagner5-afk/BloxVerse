import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';
import { WorldCollider } from './obbyWorld';

export interface TycoonButton {
  id: string;
  name: string;
  cost: number;
  position: THREE.Vector3;
  color: number;
  purchased: boolean;
  box: THREE.Box3;
  mesh: THREE.Mesh;
  onPurchase: () => void;
}

export interface TycoonDropper {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'diamond';
  value: number;
  dropInterval: number;
  timer: number;
  dropPosition: THREE.Vector3;
  mesh: THREE.Group;
}

export interface ConveyorBlock {
  mesh: THREE.Mesh;
  value: number;
  position: THREE.Vector3;
  active: boolean;
}

export function buildTycoonWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  buttons: TycoonButton[];
  droppers: TycoonDropper[];
  conveyorBlocks: ConveyorBlock[];
  conveyorBounds: THREE.Box3;
  collectorBounds: THREE.Box3;
  updateTycoon: (delta: number, onCashEarned: (amt: number) => void) => void;
  unlockStructure: (id: string) => void;
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 2, 22);

  // Materials
  const plasticMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      map: studTex,
      roughness: 0.35,
      metalness: 0.05,
    });

  // Base Plot Ground
  const plotGeo = new THREE.BoxGeometry(40, 2, 60);
  const plot = new THREE.Mesh(plotGeo, plasticMat(0x1e293b));
  plot.position.set(0, -1, 0);
  plot.receiveShadow = true;
  sceneGroup.add(plot);
  colliders.push({ box: new THREE.Box3().setFromObject(plot), type: 'solid', mesh: plot });

  // Surroundings grass
  const grass = new THREE.Mesh(new THREE.BoxGeometry(120, 1.8, 120), plasticMat(0x15803d));
  grass.position.set(0, -1.1, 0);
  grass.receiveShadow = true;
  sceneGroup.add(grass);
  colliders.push({ box: new THREE.Box3().setFromObject(grass), type: 'solid', mesh: grass });

  // Conveyor Belt in center of Tycoon (moves blocks along -Z)
  const conveyorGeo = new THREE.BoxGeometry(4, 0.4, 28);
  const conveyorMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
    metalness: 0.1,
  });
  const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat);
  conveyor.position.set(0, 0.2, -6);
  sceneGroup.add(conveyor);
  colliders.push({ box: new THREE.Box3().setFromObject(conveyor), type: 'solid', mesh: conveyor });

  // Conveyor rails
  const railMat = plasticMat(0x64748b);
  const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 28), railMat);
  leftRail.position.set(-2.2, 0.4, -6);
  sceneGroup.add(leftRail);

  const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 28), railMat);
  rightRail.position.set(2.2, 0.4, -6);
  sceneGroup.add(rightRail);

  const conveyorBounds = new THREE.Box3().setFromObject(conveyor);

  // Cash Collector Machine at the end of the conveyor (-Z end)
  const collectorGroup = new THREE.Group();
  collectorGroup.position.set(0, 2, -21);

  const collectorBox = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 3),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
  );
  collectorGroup.add(collectorBox);

  // Glowing Dollar Sign Decal / Slot
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.6, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.7,
    })
  );
  slot.position.set(0, -0.6, 1.4);
  collectorGroup.add(slot);

  sceneGroup.add(collectorGroup);
  const collectorBounds = new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(0, 1.5, -20.5),
    new THREE.Vector3(5, 3, 3)
  );

  // Conveyor dropped blocks pool
  const conveyorBlocks: ConveyorBlock[] = [];
  const blockPoolSize = 16;
  const blockGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);

  for (let i = 0; i < blockPoolSize; i++) {
    const mesh = new THREE.Mesh(
      blockGeo,
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    mesh.visible = false;
    sceneGroup.add(mesh);
    conveyorBlocks.push({
      mesh,
      value: 10,
      position: new THREE.Vector3(),
      active: false,
    });
  }

  // Dropper units
  const droppers: TycoonDropper[] = [];

  const createDropperMesh = (tier: 'silver' | 'gold' | 'diamond', pos: THREE.Vector3) => {
    const group = new THREE.Group();
    group.position.copy(pos);

    const pipeColor = tier === 'diamond' ? 0x06b6d4 : tier === 'gold' ? 0xf59e0b : 0x94a3b8;
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: pipeColor, metalness: 0.8, roughness: 0.2 })
    );
    pipe.position.set(0, 4.5, 0);
    group.add(pipe);

    // Support stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), plasticMat(0x334155));
    stand.position.set(1.4, 2.5, 0);
    group.add(stand);

    sceneGroup.add(group);
    return group;
  };

  // Starter Silver Dropper (unlocked by default)
  const starterDropperGroup = createDropperMesh('silver', new THREE.Vector3(0, 0, 4));
  droppers.push({
    id: 'dropper_1',
    name: 'Silver Dropper',
    tier: 'silver',
    value: 15,
    dropInterval: 2.2,
    timer: 0,
    dropPosition: new THREE.Vector3(0, 3.6, 4),
    mesh: starterDropperGroup,
  });

  // PURCHASEABLE STRUCTURES (Hidden until bought)
  const structures: Record<string, THREE.Group> = {};

  // 1. Walls Group
  const wallsGroup = new THREE.Group();
  const wallMat = plasticMat(0x3b82f6); // Classic Blue Tycoon walls
  // Left wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 56), wallMat);
  leftWall.position.set(-18, 5, 0);
  wallsGroup.add(leftWall);
  // Right wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 56), wallMat);
  rightWall.position.set(18, 5, 0);
  wallsGroup.add(rightWall);
  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(36, 10, 1), wallMat);
  backWall.position.set(0, 5, -28);
  wallsGroup.add(backWall);

  wallsGroup.visible = false;
  sceneGroup.add(wallsGroup);
  structures['walls'] = wallsGroup;

  // 2. Stairs & Floor 2
  const floor2Group = new THREE.Group();
  // Stairs
  for (let st = 0; st < 10; st++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(4, 1.0, 1.6), plasticMat(0x64748b));
    step.position.set(14, st * 1.0 + 0.5, 12 - st * 1.6);
    floor2Group.add(step);
  }
  // Floor 2 ceiling plate
  const floor2Plate = new THREE.Mesh(new THREE.BoxGeometry(36, 1, 56), plasticMat(0x0284c7));
  floor2Plate.position.set(0, 10.5, 0);
  floor2Group.add(floor2Plate);

  floor2Group.visible = false;
  sceneGroup.add(floor2Group);
  structures['floor2'] = floor2Group;

  // 3. Skylight & Rooftop Helipad
  const roofGroup = new THREE.Group();
  const glassRoof = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.4, 56),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
  );
  glassRoof.position.set(0, 18, 0);
  roofGroup.add(glassRoof);

  // Helipad Yellow Circle
  const helipad = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 0.4, 24),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
  );
  helipad.position.set(0, 11.2, 0);
  roofGroup.add(helipad);

  roofGroup.visible = false;
  sceneGroup.add(roofGroup);
  structures['roof'] = roofGroup;

  // STEP-ON PURCHASE BUTTONS
  const buttons: TycoonButton[] = [];

  const createButton = (id: string, name: string, cost: number, pos: THREE.Vector3, color: number) => {
    const btnMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.4, 20),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      })
    );
    btnMesh.position.copy(pos);
    sceneGroup.add(btnMesh);

    const box = new THREE.Box3().setFromObject(btnMesh);
    // Expand height slightly for easy stepping detection
    box.max.y += 1.5;

    const btn: TycoonButton = {
      id,
      name,
      cost,
      position: pos.clone(),
      color,
      purchased: false,
      box,
      mesh: btnMesh,
      onPurchase: () => {},
    };
    buttons.push(btn);
  };

  createButton('btn_speed', 'Conveyor Speed Up', 40, new THREE.Vector3(-8, 0.2, 8), 0x22c55e);
  createButton('btn_walls', 'Tycoon Walls', 100, new THREE.Vector3(8, 0.2, 8), 0x3b82f6);
  createButton('btn_gold', 'Gold Dropper', 250, new THREE.Vector3(-8, 0.2, 0), 0xf59e0b);
  createButton('btn_floor2', 'Floor 2 & Stairs', 500, new THREE.Vector3(8, 0.2, 0), 0xa855f7);
  createButton('btn_diamond', 'Diamond Dropper', 1000, new THREE.Vector3(-8, 0.2, -8), 0x06b6d4);
  createButton('btn_roof', 'Skylight & Helipad', 2000, new THREE.Vector3(8, 0.2, -8), 0xec4899);

  let conveyorSpeed = 6.0;

  const unlockStructure = (id: string) => {
    if (id === 'btn_speed') {
      conveyorSpeed = 12.0;
    } else if (id === 'btn_walls') {
      structures['walls'].visible = true;
      colliders.push({ box: new THREE.Box3().setFromObject(leftWall), type: 'solid', mesh: leftWall });
      colliders.push({ box: new THREE.Box3().setFromObject(rightWall), type: 'solid', mesh: rightWall });
      colliders.push({ box: new THREE.Box3().setFromObject(backWall), type: 'solid', mesh: backWall });
    } else if (id === 'btn_gold') {
      const goldDrop = createDropperMesh('gold', new THREE.Vector3(0, 0, -2));
      droppers.push({
        id: 'dropper_2',
        name: 'Gold Dropper',
        tier: 'gold',
        value: 50,
        dropInterval: 2.0,
        timer: 0,
        dropPosition: new THREE.Vector3(0, 3.6, -2),
        mesh: goldDrop,
      });
    } else if (id === 'btn_floor2') {
      structures['floor2'].visible = true;
      colliders.push({ box: new THREE.Box3().setFromObject(floor2Plate), type: 'solid', mesh: floor2Plate });
    } else if (id === 'btn_diamond') {
      const diamondDrop = createDropperMesh('diamond', new THREE.Vector3(0, 0, -8));
      droppers.push({
        id: 'dropper_3',
        name: 'Diamond Dropper',
        tier: 'diamond',
        value: 150,
        dropInterval: 1.8,
        timer: 0,
        dropPosition: new THREE.Vector3(0, 3.6, -8),
        mesh: diamondDrop,
      });
    } else if (id === 'btn_roof') {
      structures['roof'].visible = true;
    }
  };

  const updateTycoon = (delta: number, onCashEarned: (amt: number) => void) => {
    // 1. Process droppers
    droppers.forEach((drop) => {
      drop.timer += delta;
      if (drop.timer >= drop.dropInterval) {
        drop.timer = 0;
        // Spawn block from pool
        const inactiveBlock = conveyorBlocks.find((b) => !b.active);
        if (inactiveBlock) {
          inactiveBlock.active = true;
          inactiveBlock.value = drop.value;
          inactiveBlock.position.copy(drop.dropPosition);
          inactiveBlock.mesh.position.copy(drop.dropPosition);
          // Set color based on tier
          const col = drop.tier === 'diamond' ? 0x06b6d4 : drop.tier === 'gold' ? 0xf59e0b : 0xe2e8f0;
          (inactiveBlock.mesh.material as THREE.MeshStandardMaterial).color.set(col);
          inactiveBlock.mesh.visible = true;
        }
      }
    });

    // 2. Move blocks along conveyor belt towards Cash Collector
    conveyorBlocks.forEach((block) => {
      if (!block.active) return;

      // Gravity fall until reaching conveyor height
      if (block.position.y > 0.8) {
        block.position.y -= delta * 8;
      } else {
        block.position.y = 0.8;
        // Move towards collector (-Z direction)
        block.position.z -= delta * conveyorSpeed;
      }
      block.mesh.position.copy(block.position);

      // Check if reached collector
      if (collectorBounds.containsPoint(block.position)) {
        block.active = false;
        block.mesh.visible = false;
        onCashEarned(block.value);
      } else if (block.position.z < -25) {
        block.active = false;
        block.mesh.visible = false;
      }
    });
  };

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    buttons,
    droppers,
    conveyorBlocks,
    conveyorBounds,
    collectorBounds,
    updateTycoon,
    unlockStructure,
  };
}
