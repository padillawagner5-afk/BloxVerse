import * as THREE from 'three';
import { StudioPart } from '../../types/blox';
import { getStudTexture } from '../../utils/textures';
import { WorldCollider } from './obbyWorld';

export function buildStudioWorld(initialParts?: StudioPart[]): {
  sceneGroup: THREE.Group;
  partsGroup: THREE.Group;
  colliders: WorldCollider[];
  spawnPoint: THREE.Vector3;
  addPart: (part: StudioPart) => THREE.Mesh;
  removePart: (id: string) => void;
  updatePartColor: (id: string, color: string) => void;
  getPlacedParts: () => StudioPart[];
} {
  const sceneGroup = new THREE.Group();
  const partsGroup = new THREE.Group();
  sceneGroup.add(partsGroup);

  const colliders: WorldCollider[] = [];
  const placedParts: StudioPart[] = [];
  const partMeshMap = new Map<string, THREE.Mesh>();
  const studTex = getStudTexture();

  const spawnPoint = new THREE.Vector3(0, 1.5, 0);

  // 1. CLASSIC ROBLOX BASEPLATE (512x512 studs)
  const baseplateGeo = new THREE.BoxGeometry(160, 2, 160);
  const baseplateMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Medium stone grey
    map: studTex,
    roughness: 0.5,
    metalness: 0.05,
  });
  const baseplate = new THREE.Mesh(baseplateGeo, baseplateMat);
  baseplate.position.set(0, -1, 0);
  baseplate.receiveShadow = true;
  sceneGroup.add(baseplate);
  colliders.push({ box: new THREE.Box3().setFromObject(baseplate), type: 'solid', mesh: baseplate });

  // Grid helper lines
  const grid = new THREE.GridHelper(160, 80, 0x94a3b8, 0x334155);
  grid.position.set(0, 0.02, 0);
  sceneGroup.add(grid);

  // Default Spawn Location Pad
  const spawnPad = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4, 0.4, 24),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
    })
  );
  spawnPad.position.set(0, 0.2, 0);
  sceneGroup.add(spawnPad);

  // Function to create mesh for a studio part
  const createPartMesh = (part: StudioPart): THREE.Mesh => {
    let geo: THREE.BufferGeometry;
    if (part.type === 'cylinder') {
      geo = new THREE.CylinderGeometry(part.size[0] / 2, part.size[0] / 2, part.size[1], 16);
    } else if (part.type === 'wedge') {
      // Procedural right-angle wedge geometry
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(part.size[2], 0);
      shape.lineTo(0, part.size[1]);
      shape.closePath();
      const extrudeSettings = { depth: part.size[0], bevelEnabled: false };
      geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();
    } else {
      // Default block / truss / light
      geo = new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
    }

    let mat: THREE.Material;
    if (part.material === 'neon' || part.type === 'light') {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        emissive: new THREE.Color(part.color),
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
    } else if (part.material === 'glass') {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        map: studTex,
        roughness: 0.4,
        metalness: 0.05,
      });
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...part.position);
    mesh.rotation.set(...part.rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { partId: part.id };

    return mesh;
  };

  const addPart = (part: StudioPart): THREE.Mesh => {
    const mesh = createPartMesh(part);
    partsGroup.add(mesh);
    partMeshMap.set(part.id, mesh);
    placedParts.push(part);

    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({ box, type: 'solid', mesh, customData: part.id });
    return mesh;
  };

  const removePart = (id: string) => {
    const mesh = partMeshMap.get(id);
    if (mesh) {
      partsGroup.remove(mesh);
      mesh.geometry.dispose();
      partMeshMap.delete(id);
    }
    const idx = placedParts.findIndex((p) => p.id === id);
    if (idx !== -1) placedParts.splice(idx, 1);

    const colIdx = colliders.findIndex((c) => c.customData === id);
    if (colIdx !== -1) colliders.splice(colIdx, 1);
  };

  const updatePartColor = (id: string, color: string) => {
    const mesh = partMeshMap.get(id);
    if (mesh && (mesh.material as THREE.MeshStandardMaterial).color) {
      (mesh.material as THREE.MeshStandardMaterial).color.set(color);
      const part = placedParts.find((p) => p.id === id);
      if (part) part.color = color;
    }
  };

  // Seed default starter structures if none provided
  const starterParts: StudioPart[] = initialParts || [
    {
      id: 'p_house_1',
      type: 'block',
      position: [0, 2, -15],
      size: [12, 4, 12],
      rotation: [0, 0, 0],
      color: '#e2e8f0',
      anchored: true,
      material: 'plastic',
    },
    {
      id: 'p_roof_1',
      type: 'wedge',
      position: [0, 5, -15],
      size: [12, 3, 12],
      rotation: [0, 0, 0],
      color: '#dc2626',
      anchored: true,
      material: 'plastic',
    },
    {
      id: 'p_door_1',
      type: 'block',
      position: [0, 1.5, -9],
      size: [2.5, 3, 0.4],
      rotation: [0, 0, 0],
      color: '#92400e',
      anchored: true,
      material: 'plastic',
    },
    {
      id: 'p_step_1',
      type: 'block',
      position: [12, 1, 0],
      size: [4, 2, 4],
      rotation: [0, 0, 0],
      color: '#facc15',
      anchored: true,
      material: 'plastic',
    },
    {
      id: 'p_step_2',
      type: 'block',
      position: [12, 3, 6],
      size: [4, 2, 4],
      rotation: [0, 0, 0],
      color: '#22c55e',
      anchored: true,
      material: 'plastic',
    },
    {
      id: 'p_step_3',
      type: 'block',
      position: [12, 5, 12],
      size: [4, 2, 4],
      rotation: [0, 0, 0],
      color: '#06b6d4',
      anchored: true,
      material: 'neon',
    },
  ];

  starterParts.forEach(addPart);

  return {
    sceneGroup,
    partsGroup,
    colliders,
    spawnPoint,
    addPart,
    removePart,
    updatePartColor,
    getPlacedParts: () => placedParts,
  };
}
