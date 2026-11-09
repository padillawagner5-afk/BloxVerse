import * as THREE from 'three';
import { getStudTexture } from '../../utils/textures';
import { DynamicObstacle, WorldCollider } from './obbyWorld';

export function buildDisasterWorld(): {
  sceneGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  dynamicObstacles: DynamicObstacle[];
  updateDisaster: (delta: number, playerPos: THREE.Vector3, onDamage: (amt: number) => void) => void;
} {
  const sceneGroup = new THREE.Group();
  const colliders: WorldCollider[] = [];
  const dynamicObstacles: DynamicObstacle[] = [];
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 3, 0);

  // Materials
  const plasticMat = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      map: studTex,
      roughness: 0.45,
      metalness: 0.05,
    });

  // 1. SURVIVAL ISLAND (Rocky cliff island surrounded by sea)
  const islandGeo = new THREE.CylinderGeometry(40, 48, 6, 32);
  const island = new THREE.Mesh(islandGeo, plasticMat(0x16a34a)); // Grass top
  island.position.set(0, 0, 0);
  island.receiveShadow = true;
  sceneGroup.add(island);
  colliders.push({ box: new THREE.Box3().setFromObject(island), type: 'solid', mesh: island });

  // Sandy Shore around
  const sandGeo = new THREE.CylinderGeometry(45, 52, 4, 32);
  const sand = new THREE.Mesh(sandGeo, plasticMat(0xfef08a));
  sand.position.set(0, -2, 0);
  sand.receiveShadow = true;
  sceneGroup.add(sand);
  colliders.push({ box: new THREE.Box3().setFromObject(sand), type: 'solid', mesh: sand });

  // 2. SURVIVAL SCHOOL / MULTI-STORY HOUSE
  const houseGroup = new THREE.Group();
  houseGroup.position.set(-10, 3, -8);

  // First Floor
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 14), plasticMat(0xe2e8f0));
  f1.position.set(0, 3, 0);
  f1.castShadow = true;
  f1.receiveShadow = true;
  houseGroup.add(f1);
  colliders.push({ box: new THREE.Box3().setFromObject(f1), type: 'solid', mesh: f1 });

  // Second Floor
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 14), plasticMat(0x94a3b8));
  f2.position.set(0, 9, 0);
  f2.castShadow = true;
  houseGroup.add(f2);
  colliders.push({ box: new THREE.Box3().setFromObject(f2), type: 'solid', mesh: f2 });

  // Rooftop Railing & Escape pad
  const roof = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 16), plasticMat(0xdc2626));
  roof.position.set(0, 12.4, 0);
  houseGroup.add(roof);
  colliders.push({ box: new THREE.Box3().setFromObject(roof), type: 'solid', mesh: roof });

  // External emergency staircase
  for (let s = 0; s < 12; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 1.2), plasticMat(0x475569));
    step.position.set(9.5, s * 1.0 + 0.3, -6 + s * 1.0);
    houseGroup.add(step);
    colliders.push({ box: new THREE.Box3().setFromObject(step), type: 'solid', mesh: step });
  }

  sceneGroup.add(houseGroup);

  // 3. TALL LIGHTHOUSE / WATCHTOWER (Safest point during floods)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(18, 3, 10);

  const towerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 4.5, 26, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, map: studTex, roughness: 0.4 })
  );
  towerBody.position.set(0, 13, 0);
  towerBody.castShadow = true;
  towerGroup.add(towerBody);
  colliders.push({ box: new THREE.Box3().setFromObject(towerBody), type: 'solid', mesh: towerBody });

  // Lighthouse Observation Deck & Beacon
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.5, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  deck.position.set(0, 26.5, 0);
  towerGroup.add(deck);
  colliders.push({ box: new THREE.Box3().setFromObject(deck), type: 'solid', mesh: deck });

  // Rotating Light Beacon
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    })
  );
  beacon.position.set(0, 28.5, 0);
  towerGroup.add(beacon);

  // Truss ladder up lighthouse
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.6, 26, 0.4), plasticMat(0xfacc15));
  ladder.position.set(0, 13, 4.6);
  towerGroup.add(ladder);
  colliders.push({ box: new THREE.Box3().setFromObject(ladder), type: 'solid', mesh: ladder });

  sceneGroup.add(towerGroup);

  // 4. ACID WATER / FLOOD OCEAN PLANE
  const floodWaterGeo = new THREE.CylinderGeometry(80, 80, 2, 32);
  const floodWaterMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4, // Cyan water, turns acid green/red during flood
    transparent: true,
    opacity: 0.75,
    roughness: 0.1,
    metalness: 0.2,
  });
  const floodWater = new THREE.Mesh(floodWaterGeo, floodWaterMat);
  floodWater.position.set(0, -2, 0);
  sceneGroup.add(floodWater);

  // 5. METEORS PARTICLES / SPAWNER
  const meteors: { mesh: THREE.Mesh; vel: THREE.Vector3; active: boolean }[] = [];
  const meteorMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.8,
    roughness: 0.3,
  });
  for (let m = 0; m < 6; m++) {
    const meteor = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0), meteorMat);
    meteor.visible = false;
    sceneGroup.add(meteor);
    meteors.push({ mesh: meteor, vel: new THREE.Vector3(), active: false });
  }

  // Disaster State cycle
  let disasterTimer = 0;
  let currentDisaster: 'flood' | 'meteors' = 'flood';
  let floodHeight = -2;

  const updateDisaster = (delta: number, playerPos: THREE.Vector3, onDamage: (amt: number) => void) => {
    disasterTimer += delta;

    // Rotate lighthouse beacon
    beacon.rotation.y += delta * 2;

    // Cycle disaster every 30 seconds
    if (disasterTimer > 35) {
      disasterTimer = 0;
      currentDisaster = currentDisaster === 'flood' ? 'meteors' : 'flood';
      floodHeight = -2;
      floodWater.position.y = -2;
    }

    if (currentDisaster === 'flood') {
      // Water rises up to Y=16
      if (floodHeight < 16) {
        floodHeight += delta * 0.8;
        floodWater.position.y = floodHeight;
        floodWaterMat.color.set(0x22c55e); // Acid green!
      }

      // Check if player is submerged under rising acid flood
      if (playerPos.y < floodHeight + 1.0) {
        onDamage(25 * delta); // Sizzle damage in acid water
      }
    } else {
      // METEOR SHOWER!
      floodWaterMat.color.set(0x06b6d4);
      if (floodHeight > -2) {
        floodHeight -= delta * 3;
        floodWater.position.y = floodHeight;
      }

      // Drop meteors from sky
      meteors.forEach((m) => {
        if (!m.active && Math.random() < 0.04) {
          m.active = true;
          m.mesh.position.set(
            playerPos.x + (Math.random() - 0.5) * 40,
            45,
            playerPos.z + (Math.random() - 0.5) * 40
          );
          m.vel.set((Math.random() - 0.5) * 10, -28, (Math.random() - 0.5) * 10);
          m.mesh.visible = true;
        }

        if (m.active) {
          m.mesh.position.addScaledVector(m.vel, delta);
          m.mesh.rotation.x += delta * 3;

          // Check hit with ground or player
          if (m.mesh.position.y <= 1.0) {
            m.active = false;
            m.mesh.visible = false;
            // Blast radius damage
            if (m.mesh.position.distanceTo(playerPos) < 7.0) {
              onDamage(40);
            }
          }
        }
      });
    }
  };

  return {
    sceneGroup,
    colliders,
    spawnPoint,
    dynamicObstacles,
    updateDisaster,
  };
}
