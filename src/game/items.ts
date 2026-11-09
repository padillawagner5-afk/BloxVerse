import * as THREE from 'three';
import { ToolItem } from '../types/blox';

/**
 * Procedural 3D tools and weapons for BloxVerse (Sword, Rocket Launcher, Coils, Bloxy Cola, B-Tools)
 * All procedural geometry and PBR materials with varied roughness/metalness.
 */

export const DEFAULT_HOTBAR_TOOLS: ToolItem[] = [
  { id: 'sword', name: 'Linked Sword', slot: 1, icon: '⚔️', type: 'sword', cooldown: 0.4 },
  { id: 'rocket', name: 'Rocket Launcher', slot: 2, icon: '🚀', type: 'rocket', cooldown: 1.2 },
  { id: 'speed_coil', name: 'Speed Coil', slot: 3, icon: '⚡', type: 'speed_coil', cooldown: 0 },
  { id: 'gravity_coil', name: 'Gravity Coil', slot: 4, icon: '🌀', type: 'gravity_coil', cooldown: 0 },
  { id: 'cola', name: 'Bloxy Cola', slot: 5, icon: '🥤', type: 'cola', cooldown: 2.0 },
  { id: 'btools', name: 'B-Tools', slot: 6, icon: '🔨', type: 'btools', cooldown: 0 },
];

/**
 * Creates 3D procedural mesh for a tool item.
 */
export function createToolMesh(type: ToolItem['type']): THREE.Group {
  const group = new THREE.Group();

  if (type === 'sword') {
    // Classic Linked Sword (Hilt, Crossguard, Blade, Pommel)
    // 1. Blade
    const bladeGeo = new THREE.BoxGeometry(0.24, 2.4, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 1.4, 0);
    blade.castShadow = true;
    group.add(blade);

    // Tip angle
    const tipGeo = new THREE.ConeGeometry(0.17, 0.4, 4);
    tipGeo.rotateY(Math.PI / 4);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    tip.position.set(0, 2.65, 0);
    tip.castShadow = true;
    group.add(tip);

    // 2. Golden Crossguard
    const guardGeo = new THREE.BoxGeometry(0.9, 0.16, 0.22);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const guard = new THREE.Mesh(guardGeo, goldMat);
    guard.position.set(0, 0.2, 0);
    guard.castShadow = true;
    group.add(guard);

    // 3. Grip handle
    const gripGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.6, 12);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Dark leather
      roughness: 0.7,
      metalness: 0.1,
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.15, 0);
    group.add(grip);

    // 4. Pommel
    const pommelGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const pommel = new THREE.Mesh(pommelGeo, goldMat);
    pommel.position.set(0, -0.5, 0);
    group.add(pommel);

    // Orient forward in hand
    group.rotation.x = -Math.PI / 2.5;
  } else if (type === 'rocket') {
    // Classic Rocket Launcher (Cylinder barrel, handle grip, sight, rocket warhead)
    // 1. Main Tube Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.3, 0.32, 2.4, 16);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 0.4);
    barrel.castShadow = true;
    group.add(barrel);

    // 2. Shoulder Rest & Exhaust Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.42, 0.28, 0.5, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, barrelMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0, 0, -0.9);
    group.add(nozzle);

    // 3. Dual Pistol Grips
    const gripGeo = new THREE.BoxGeometry(0.14, 0.6, 0.16);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
    });
    const gripFront = new THREE.Mesh(gripGeo, gripMat);
    gripFront.position.set(0, -0.4, 0.6);
    group.add(gripFront);

    const gripRear = new THREE.Mesh(gripGeo, gripMat);
    gripRear.position.set(0, -0.4, 0.0);
    group.add(gripRear);

    // 4. Red Rocket Loaded in Front
    const rocketHeadGeo = new THREE.ConeGeometry(0.26, 0.6, 12);
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.4,
      roughness: 0.3,
    });
    const rocket = new THREE.Mesh(rocketHeadGeo, redMat);
    rocket.rotation.x = Math.PI / 2;
    rocket.position.set(0, 0, 1.8);
    group.add(rocket);

    // Orient on shoulder
    group.position.set(0.2, 0.1, 0.1);
  } else if (type === 'gravity_coil' || type === 'speed_coil') {
    // Helical spring coil
    const isGravity = type === 'gravity_coil';
    const coilColor = isGravity ? 0x06b6d4 : 0xef4444; // Cyan vs Red

    // Create helical curve
    const points: THREE.Vector3[] = [];
    const turns = 4;
    const radius = 0.38;
    const height = 1.4;
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      const angle = u * Math.PI * 2 * turns;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, (u - 0.5) * height, Math.sin(angle) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const coilGeo = new THREE.TubeGeometry(curve, 60, 0.08, 8, false);
    const coilMat = new THREE.MeshStandardMaterial({
      color: coilColor,
      metalness: 0.85,
      roughness: 0.2,
      emissive: coilColor,
      emissiveIntensity: 0.25,
    });
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.castShadow = true;
    group.add(coil);

    // Top and bottom metallic caps
    const capGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 16);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.25,
    });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.set(0, 0.72, 0);
    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.set(0, -0.72, 0);
    group.add(topCap);
    group.add(botCap);

    group.rotation.x = -Math.PI / 4;
  } else if (type === 'cola') {
    // Bloxy Cola Can
    const canGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16);
    const canMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Bright Red
      roughness: 0.3,
      metalness: 0.6,
    });
    const can = new THREE.Mesh(canGeo, canMat);
    can.castShadow = true;
    group.add(can);

    // Silver top rim & pop tab
    const rimGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.1, 16);
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, silverMat);
    rim.position.set(0, 0.45, 0);
    group.add(rim);

    // Pop tab
    const tabGeo = new THREE.BoxGeometry(0.12, 0.04, 0.2);
    const tab = new THREE.Mesh(tabGeo, silverMat);
    tab.position.set(0, 0.52, 0.08);
    group.add(tab);

    group.rotation.x = -Math.PI / 3;
  } else if (type === 'btools') {
    // B-Tools Magic Building Wand
    const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12);
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.5,
    });
    const handle = new THREE.Mesh(handleGeo, blueMat);
    group.add(handle);

    // Glowing Star/Cube Tip
    const starGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(0, 0.9, 0);
    star.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    group.add(star);

    group.rotation.x = -Math.PI / 3;
  }

  return group;
}
