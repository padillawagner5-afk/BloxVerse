import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { AvatarCustomization, ToolItem, WorldId, StudioPart } from '../types/blox';
import { BloxAvatar } from './Avatar';
import { bloxAudio } from '../audio/soundEffects';
import { createToolMesh, DEFAULT_HOTBAR_TOOLS } from './items';
import { buildObbyWorld, DynamicObstacle, WorldCollider } from './worlds/obbyWorld';
import { buildCrossroadsWorld, TargetBot } from './worlds/crossroadsWorld';
import { buildTycoonWorld, TycoonButton } from './worlds/tycoonWorld';
import { buildStudioWorld } from './worlds/studioWorld';
import { buildDisasterWorld } from './worlds/disasterWorld';
import { buildSpeedrunWorld } from './worlds/speedrunWorld';
import { buildSfothWorld } from './worlds/sfothWorld';
import { createRobloxSkyTexture } from '../utils/textures';

// Pre-allocated math helpers for zero GC in animation loop
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _playerBox = new THREE.Box3();

export interface EngineCallbacks {
  onHealthChange?: (hp: number, maxHp: number) => void;
  onCoinsChange?: (coins: number) => void;
  onStageChange?: (stage: number) => void;
  onKosChange?: (kos: number) => void;
  onWipeoutsChange?: (wipeouts: number) => void;
  onChatMessage?: (sender: string, text: string) => void;
  onCheckpointReached?: (stage: number) => void;
}

export class BloxEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public avatar: BloxAvatar;
  public currentWorldId: WorldId;

  // Software GL Detection
  public isSoftwareGl: boolean = false;

  // World Data
  public worldGroup: THREE.Group;
  public colliders: WorldCollider[] = [];
  public dynamicObstacles: DynamicObstacle[] = [];
  public bots: TargetBot[] = [];
  public tycoonButtons: TycoonButton[] = [];
  private updateTycoonFn?: (delta: number, onCash: (amt: number) => void) => void;
  public unlockStructureFn?: (id: string) => void;
  public updateDisasterFn?: (delta: number, playerPos: THREE.Vector3, onDamage: (amt: number) => void) => void;
  public studioHelpers?: {
    addPart: (part: StudioPart) => THREE.Mesh;
    removePart: (id: string) => void;
    updatePartColor: (id: string, color: string) => void;
    getPlacedParts: () => StudioPart[];
  };

  // Player State
  public playerPosition = new THREE.Vector3(0, 3, 0);
  public playerVelocity = new THREE.Vector3(0, 0, 0);
  public isGrounded: boolean = false;
  public health: number = 100;
  public maxHealth: number = 100;
  public coins: number = 100;
  public currentStage: number = 0;
  public checkpoints: THREE.Vector3[] = [];
  public kos: number = 0;
  public wipeouts: number = 0;
  private isDead: boolean = false;

  // Active Tool & Equipped 3D Mesh
  public equippedTool: ToolItem | null = null;
  private equippedToolMesh: THREE.Group | null = null;
  private toolCooldownTimer: number = 0;

  // Rocket projectiles in flight
  private rockets: {
    mesh: THREE.Group;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    life: number;
  }[] = [];

  // Input & Controls
  public keys: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public isPointerDown: boolean = false;
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.35;
  public cameraDistance: number = 14;
  private targetCameraDistance: number = 14;

  // Loop control
  private frameId: number = 0;
  private clock: THREE.Clock;
  private isDisposed: boolean = false;
  private callbacks: EngineCallbacks;

  // Studio tool state
  public studioToolMode: 'place' | 'delete' | 'color' = 'place';
  public studioActivePartType: StudioPart['type'] = 'block';
  public studioActiveColor: string = '#facc15';
  public studioActiveMaterial: StudioPart['material'] = 'plastic';
  public studioGridSnap: number = 2.0;

  constructor(
    container: HTMLElement,
    worldId: WorldId,
    avatarCustomization: AvatarCustomization,
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.currentWorldId = worldId;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.replaceChildren(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = createRobloxSkyTexture();
    this.scene.fog = new THREE.FogExp2(0xbbe4fc, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.2,
      600
    );

    // 4. Studio Environment & Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig (Key + Fill + Rim)
    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    dirLight.position.set(40, 70, 30);
    dirLight.castShadow = !this.isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 180;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x475569, 1.1);
    this.scene.add(hemiLight);

    // 6. World Group
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    // 7. Avatar
    this.avatar = new BloxAvatar(avatarCustomization);
    this.scene.add(this.avatar.root);

    // Load initial world
    this.loadWorld(worldId);

    // Equip default sword
    this.equipTool(DEFAULT_HOTBAR_TOOLS[0]);

    // Attach Input Listeners
    this.setupInputs();

    // Start Animation Loop
    this.tick = this.tick.bind(this);
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  public loadWorld(worldId: WorldId) {
    this.currentWorldId = worldId;

    // Clear previous world
    while (this.worldGroup.children.length > 0) {
      this.worldGroup.remove(this.worldGroup.children[0]);
    }
    this.colliders = [];
    this.dynamicObstacles = [];
    this.bots = [];
    this.tycoonButtons = [];
    this.updateTycoonFn = undefined;
    this.unlockStructureFn = undefined;
    this.updateDisasterFn = undefined;
    this.studioHelpers = undefined;

    let spawn = new THREE.Vector3(0, 3, 0);

    if (worldId === 'obby') {
      const obby = buildObbyWorld();
      this.worldGroup.add(obby.sceneGroup);
      this.colliders = obby.colliders;
      this.dynamicObstacles = obby.dynamicObstacles;
      this.checkpoints = obby.checkpointPositions;
      spawn = obby.spawnPoint;
      this.currentStage = 0;
      this.callbacks.onStageChange?.(0);
    } else if (worldId === 'crossroads') {
      const cr = buildCrossroadsWorld();
      this.worldGroup.add(cr.sceneGroup);
      this.colliders = cr.colliders;
      this.bots = cr.bots;
      spawn = cr.spawnPoint;
      this.checkpoints = [spawn.clone()];
    } else if (worldId === 'tycoon') {
      const ty = buildTycoonWorld();
      this.worldGroup.add(ty.sceneGroup);
      this.colliders = ty.colliders;
      this.tycoonButtons = ty.buttons;
      this.updateTycoonFn = ty.updateTycoon;
      this.unlockStructureFn = ty.unlockStructure;
      spawn = ty.spawnPoint;
      this.checkpoints = [spawn.clone()];
    } else if (worldId === 'studio') {
      const st = buildStudioWorld();
      this.worldGroup.add(st.sceneGroup);
      this.colliders = st.colliders;
      this.studioHelpers = {
        addPart: st.addPart,
        removePart: st.removePart,
        updatePartColor: st.updatePartColor,
        getPlacedParts: st.getPlacedParts,
      };
      spawn = st.spawnPoint;
      this.checkpoints = [spawn.clone()];
    } else if (worldId === 'disaster') {
      const dis = buildDisasterWorld();
      this.worldGroup.add(dis.sceneGroup);
      this.colliders = dis.colliders;
      this.dynamicObstacles = dis.dynamicObstacles;
      this.updateDisasterFn = dis.updateDisaster;
      spawn = dis.spawnPoint;
      this.checkpoints = [spawn.clone()];
    } else if (worldId === 'speedrun') {
      const sr = buildSpeedrunWorld();
      this.worldGroup.add(sr.sceneGroup);
      this.colliders = sr.colliders;
      this.checkpoints = sr.checkpoints;
      spawn = sr.spawnPoint;
    } else if (worldId === 'sfoth') {
      const sf = buildSfothWorld();
      this.worldGroup.add(sf.sceneGroup);
      this.colliders = sf.colliders;
      this.bots = sf.bots;
      spawn = sf.spawnPoint;
      this.checkpoints = [spawn.clone()];
    }

    this.respawn(spawn);
  }

  public respawn(customPos?: THREE.Vector3) {
    this.isDead = false;
    this.health = this.maxHealth;
    this.callbacks.onHealthChange?.(this.health, this.maxHealth);

    const targetPos =
      customPos ||
      (this.checkpoints.length > this.currentStage
        ? this.checkpoints[this.currentStage]
        : this.checkpoints[0]) ||
      new THREE.Vector3(0, 3, 0);

    this.playerPosition.copy(targetPos);
    this.playerVelocity.set(0, 0, 0);
    this.avatar.root.position.copy(this.playerPosition);
  }

  public triggerDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.wipeouts++;
    this.callbacks.onWipeoutsChange?.(this.wipeouts);
    this.callbacks.onHealthChange?.(0, this.maxHealth);

    // Play legendary OOF sound
    bloxAudio.playOof();
    this.avatar.showSpeech('oof');

    // Slight ragdoll fall & respawn after 1.2s
    setTimeout(() => {
      this.respawn();
    }, 1200);
  }

  public equipTool(tool: ToolItem | null) {
    // Clear currently equipped mesh
    if (this.equippedToolMesh) {
      this.avatar.toolSocket.remove(this.equippedToolMesh);
      this.equippedToolMesh = null;
    }

    this.equippedTool = tool;
    if (tool) {
      const mesh = createToolMesh(tool.type);
      this.equippedToolMesh = mesh;
      this.avatar.toolSocket.add(mesh);
    }
  }

  public triggerEmote(emote: 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin') {
    this.avatar.currentAnim = emote;
    const msg = `/e ${emote}`;
    this.avatar.showSpeech(msg);
    this.callbacks.onChatMessage?.(this.avatar['customization'].username, msg);
  }

  public sendChat(text: string) {
    if (!text.trim()) return;
    this.avatar.showSpeech(text);
    this.callbacks.onChatMessage?.(this.avatar['customization'].username, text);

    // Check for emote commands
    const lower = text.trim().toLowerCase();
    if (lower === '/e dance') this.avatar.currentAnim = 'dance';
    else if (lower === '/e wave') this.avatar.currentAnim = 'wave';
    else if (lower === '/e cheer') this.avatar.currentAnim = 'cheer';
    else if (lower === '/e point') this.avatar.currentAnim = 'point';
    else if (lower === '/e flip') this.avatar.currentAnim = 'flip';
    else if (lower === '/e spin') this.avatar.currentAnim = 'spin';
  }

  // Handle active tool click / use
  public useEquippedTool() {
    if (!this.equippedTool || this.toolCooldownTimer > 0 || this.isDead) return;
    this.toolCooldownTimer = this.equippedTool.cooldown;

    this.avatar.triggerToolSwing();

    const type = this.equippedTool.type;

    if (type === 'sword') {
      bloxAudio.playSwordSwing();

      // Check hit against bots
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.avatar.root.rotation.y);
      this.bots.forEach((bot) => {
        if (bot.isDead) return;
        const dist = bot.position.distanceTo(this.playerPosition);
        if (dist < 5.0) {
          bloxAudio.playSwordClang();
          bot.health -= 35;
          // Knockback
          bot.velocity.addScaledVector(forward, 12);
          bot.velocity.y += 6;
          if (bot.health <= 0) {
            bot.isDead = true;
            bot.respawnTime = 4.0;
            this.kos++;
            this.callbacks.onKosChange?.(this.kos);
            bloxAudio.playOof();
          }
        }
      });
    } else if (type === 'rocket') {
      bloxAudio.playRocketLaunch();

      // Spawn projectile
      const forward = new THREE.Vector3(0, 0.1, 1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.avatar.root.rotation.y)
        .normalize();

      const rocketGeo = new THREE.ConeGeometry(0.35, 1.2, 12);
      rocketGeo.rotateX(Math.PI / 2);
      const rocketMesh = new THREE.Mesh(
        rocketGeo,
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 })
      );
      const spawnPos = this.playerPosition.clone().add(new THREE.Vector3(0, 3.2, 0)).addScaledVector(forward, 2);
      rocketMesh.position.copy(spawnPos);
      rocketMesh.lookAt(spawnPos.clone().add(forward));
      this.scene.add(rocketMesh);

      this.rockets.push({
        mesh: new THREE.Group().add(rocketMesh),
        pos: spawnPos,
        vel: forward.multiplyScalar(42),
        life: 3.5,
      });
    } else if (type === 'cola') {
      bloxAudio.playBloxyCola();
      this.health = Math.min(this.maxHealth, this.health + 30);
      this.callbacks.onHealthChange?.(this.health, this.maxHealth);
      this.avatar.showSpeech('*glug glug*');
    } else if (type === 'gravity_coil') {
      bloxAudio.playCoilBoing();
      this.playerVelocity.y = 28; // Super jump!
    } else if (type === 'speed_coil') {
      bloxAudio.playJump();
    } else if (type === 'btools') {
      bloxAudio.playPlaceBrick();
    }
  }

  // Studio Click Handler
  public handleStudioRaycast(clientX: number, clientY: number) {
    if (this.currentWorldId !== 'studio' || !this.studioHelpers) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    _raycaster.setFromCamera(mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.worldGroup.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0];

      if (this.studioToolMode === 'place') {
        const snap = this.studioGridSnap;
        // Snap hit point + normal
        const p = hit.point.clone().addScaledVector(hit.face?.normal || new THREE.Vector3(0, 1, 0), 1.0);
        const snappedX = Math.round(p.x / snap) * snap;
        const snappedY = Math.max(1, Math.round(p.y / snap) * snap);
        const snappedZ = Math.round(p.z / snap) * snap;

        const newPart: StudioPart = {
          id: `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: this.studioActivePartType,
          position: [snappedX, snappedY, snappedZ],
          size: [snap * 2, snap * 2, snap * 2],
          rotation: [0, 0, 0],
          color: this.studioActiveColor,
          anchored: true,
          material: this.studioActiveMaterial,
        };

        this.studioHelpers.addPart(newPart);
        bloxAudio.playPlaceBrick();
      } else if (this.studioToolMode === 'delete') {
        // Find if hit part belongs to user
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !obj.userData?.partId && obj !== this.scene) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.partId) {
          this.studioHelpers.removePart(obj.userData.partId);
          bloxAudio.playDeleteBrick();
        }
      } else if (this.studioToolMode === 'color') {
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !obj.userData?.partId && obj !== this.scene) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.partId) {
          this.studioHelpers.updatePartColor(obj.userData.partId, this.studioActiveColor);
          bloxAudio.playPlaceBrick();
        }
      }
    }
  }

  // Software GL pace loop
  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  // Animation Loop Tick
  private tick() {
    if (this.isDisposed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Tool cooldown
    if (this.toolCooldownTimer > 0) {
      this.toolCooldownTimer -= delta;
    }

    // 2. Physics & Movement
    this.updatePlayerPhysics(delta);

    // 3. Dynamic Obstacles (e.g. Obby rotating lava beams)
    this.dynamicObstacles.forEach((obs) => {
      obs.update(delta, elapsed);
      // Check collision with player
      _playerBox.setFromCenterAndSize(
        this.playerPosition.clone().add(new THREE.Vector3(0, 2.5, 0)),
        new THREE.Vector3(2.0, 4.8, 1.2)
      );
      if (obs.type === 'lava' && obs.getCollider().intersectsBox(_playerBox)) {
        this.triggerDeath();
      }
    });

    // 3.5 Natural Disaster survival updates
    if (this.updateDisasterFn) {
      this.updateDisasterFn(delta, this.playerPosition, (dmg) => {
        this.health = Math.max(0, this.health - dmg);
        this.callbacks.onHealthChange?.(this.health, this.maxHealth);
        bloxAudio.playOof();
        if (this.health <= 0) {
          this.triggerDeath();
        }
      });
    }

    // 4. Tycoon conveyor and droppers
    if (this.updateTycoonFn) {
      this.updateTycoonFn(delta, (amt) => {
        this.coins += amt;
        this.callbacks.onCoinsChange?.(this.coins);
        bloxAudio.playCoin();
      });

      // Check stepping on buy buttons
      this.tycoonButtons.forEach((btn) => {
        if (btn.purchased) return;
        if (btn.box.containsPoint(this.playerPosition)) {
          if (this.coins >= btn.cost) {
            this.coins -= btn.cost;
            this.callbacks.onCoinsChange?.(this.coins);
            btn.purchased = true;
            (btn.mesh.material as THREE.MeshStandardMaterial).color.set(0x475569);
            bloxAudio.playVictory();
            this.unlockStructureFn?.(btn.id);
            this.avatar.showSpeech(`Bought ${btn.name}!`);
          }
        }
      });
    }

    // 5. Crossroads Bots AI
    this.updateBots(delta);

    // 6. Rocket Projectiles
    this.updateRockets(delta);

    // 7. Follow Camera
    this.updateCamera(delta);

    // 8. Render
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private updatePlayerPhysics(delta: number) {
    if (this.isDead) return;

    // Base attributes
    let moveSpeed = 16.0;
    let gravity = -38.0;
    let jumpForce = 18.0;

    // Tool speed / gravity buffs
    if (this.equippedTool?.type === 'speed_coil') {
      moveSpeed = 34.0;
    }
    if (this.equippedTool?.type === 'gravity_coil') {
      gravity = -14.0;
      jumpForce = 26.0;
    }

    // Input direction relative to camera yaw
    let inputX = 0;
    let inputZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputZ += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputZ -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputX += 1;

    // Mobile Virtual Joystick input
    if (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05) {
      inputX = this.joystickVector.x;
      inputZ = -this.joystickVector.y;
    }

    const isMoving = Math.abs(inputX) > 0.01 || Math.abs(inputZ) > 0.01;

    if (isMoving) {
      _moveDir.set(inputX, 0, inputZ).normalize();
      _moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      this.playerVelocity.x = _moveDir.x * moveSpeed;
      this.playerVelocity.z = _moveDir.z * moveSpeed;

      // Rotate avatar towards movement direction
      const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
      this.avatar.root.rotation.y = THREE.MathUtils.damp(
        this.avatar.root.rotation.y,
        targetAngle,
        14,
        delta
      );
    } else {
      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, 12, delta);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, 12, delta);
    }

    // Jump
    if ((this.keys['Space'] || this.keys['KeyJ']) && this.isGrounded) {
      this.playerVelocity.y = jumpForce;
      this.isGrounded = false;
      if (this.equippedTool?.type === 'gravity_coil') {
        bloxAudio.playCoilBoing();
      } else {
        bloxAudio.playJump();
      }
    }

    // Apply Gravity
    this.playerVelocity.y += gravity * delta;

    // Candidate new position
    const nextPos = this.playerPosition.clone().addScaledVector(this.playerVelocity, delta);

    // Collision Detection with World Colliders
    _playerBox.setFromCenterAndSize(
      nextPos.clone().add(new THREE.Vector3(0, 2.5, 0)),
      new THREE.Vector3(1.8, 4.8, 1.2)
    );

    let onGround = false;

    for (const col of this.colliders) {
      if (col.type === 'solid') {
        if (col.box.intersectsBox(_playerBox)) {
          // Check if landing on top
          if (
            this.playerVelocity.y <= 0 &&
            this.playerPosition.y >= col.box.max.y - 0.6
          ) {
            nextPos.y = col.box.max.y;
            this.playerVelocity.y = 0;
            onGround = true;
          } else {
            // Horizontal wall pushback
            if (this.playerPosition.x > col.box.max.x) nextPos.x = col.box.max.x + 0.9;
            else if (this.playerPosition.x < col.box.min.x) nextPos.x = col.box.min.x - 0.9;

            if (this.playerPosition.z > col.box.max.z) nextPos.z = col.box.max.z + 0.6;
            else if (this.playerPosition.z < col.box.min.z) nextPos.z = col.box.min.z - 0.6;
          }
        }
      } else if (col.type === 'lava') {
        if (col.box.intersectsBox(_playerBox)) {
          this.triggerDeath();
          return;
        }
      } else if (col.type === 'checkpoint') {
        if (col.box.intersectsBox(_playerBox) && col.checkpointIndex !== undefined) {
          if (col.checkpointIndex > this.currentStage) {
            this.currentStage = col.checkpointIndex;
            this.callbacks.onStageChange?.(this.currentStage);
            this.callbacks.onCheckpointReached?.(this.currentStage);
            bloxAudio.playVictory();
            this.avatar.showSpeech(`Stage ${this.currentStage} Checkpoint!`);
          }
        }
      } else if (col.type === 'jumppad') {
        if (col.box.intersectsBox(_playerBox)) {
          this.playerVelocity.y = 38; // Super Trampoline launch!
          onGround = false;
          bloxAudio.playCoilBoing();
        }
      } else if (col.type === 'speedpad') {
        if (col.box.intersectsBox(_playerBox)) {
          this.playerVelocity.z += 42; // Catapult speed boost!
          bloxAudio.playCoilBoing();
        }
      } else if (col.type === 'winner') {
        if (col.box.intersectsBox(_playerBox) && this.currentStage < 5) {
          this.currentStage = 5;
          this.callbacks.onStageChange?.(5);
          bloxAudio.playVictory();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          this.avatar.showSpeech('🏆 WINNER! GG!');
        }
      }
    }

    this.isGrounded = onGround;
    this.playerPosition.copy(nextPos);

    // Void death barrier (if fell off world)
    if (this.playerPosition.y < -30) {
      this.triggerDeath();
      return;
    }

    // Update Avatar mesh position and kinematics
    this.avatar.root.position.copy(this.playerPosition);
    this.avatar.update(
      delta,
      isMoving,
      Math.hypot(this.playerVelocity.x, this.playerVelocity.z),
      this.isGrounded,
      this.playerVelocity.y
    );
  }

  private updateBots(delta: number) {
    this.bots.forEach((bot) => {
      if (bot.isDead) {
        bot.respawnTime -= delta;
        bot.group.visible = false;
        if (bot.respawnTime <= 0) {
          bot.isDead = false;
          bot.health = bot.maxHealth;
          bot.position.set(
            (Math.random() - 0.5) * 40,
            0,
            (Math.random() - 0.5) * 40
          );
          bot.group.visible = true;
        }
        return;
      }

      // Wander logic
      if (Math.random() < 0.02) {
        bot.targetPos.set(
          bot.position.x + (Math.random() - 0.5) * 16,
          0,
          bot.position.z + (Math.random() - 0.5) * 16
        );
      }

      _v1.subVectors(bot.targetPos, bot.position);
      _v1.y = 0;
      if (_v1.length() > 0.5) {
        _v1.normalize();
        bot.position.addScaledVector(_v1, delta * 3.5);
        bot.group.rotation.y = Math.atan2(_v1.x, _v1.z);
      }

      // Apply vertical bot velocity (knockback recovery)
      if (bot.velocity.lengthSq() > 0.01) {
        bot.position.addScaledVector(bot.velocity, delta);
        bot.velocity.multiplyScalar(0.92);
      }

      bot.group.position.copy(bot.position);
    });
  }

  private updateRockets(delta: number) {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life -= delta;
      r.pos.addScaledVector(r.vel, delta);
      r.mesh.position.copy(r.pos);

      let exploded = false;

      // Check collision with obstacles or ground
      if (r.pos.y <= 0 || r.life <= 0) {
        exploded = true;
      }

      if (!exploded) {
        _v1.copy(r.pos);
        for (const col of this.colliders) {
          if (col.type === 'solid' && col.box.containsPoint(_v1)) {
            exploded = true;
            break;
          }
        }
      }

      // Check collision with bots
      if (!exploded) {
        for (const bot of this.bots) {
          if (!bot.isDead && bot.position.distanceTo(r.pos) < 3.0) {
            exploded = true;
            bot.health -= 65;
            bot.velocity.set((Math.random() - 0.5) * 20, 14, (Math.random() - 0.5) * 20);
            if (bot.health <= 0) {
              bot.isDead = true;
              bot.respawnTime = 4.0;
              this.kos++;
              this.callbacks.onKosChange?.(this.kos);
              bloxAudio.playOof();
            }
            break;
          }
        }
      }

      if (exploded) {
        bloxAudio.playExplosion();
        // Knockback player if near blast
        const distToPlayer = this.playerPosition.distanceTo(r.pos);
        if (distToPlayer < 7.0) {
          _v2.subVectors(this.playerPosition, r.pos).normalize();
          this.playerVelocity.addScaledVector(_v2, 24);
          this.playerVelocity.y += 12;
          this.health = Math.max(10, this.health - 25);
          this.callbacks.onHealthChange?.(this.health, this.maxHealth);
          bloxAudio.playOof();
        }

        this.scene.remove(r.mesh);
        this.rockets.splice(i, 1);
      }
    }
  }

  private updateCamera(delta: number) {
    // Smooth camera distance zoom damping
    this.cameraDistance = THREE.MathUtils.damp(
      this.cameraDistance,
      this.targetCameraDistance,
      12,
      delta
    );

    // Spherical offset from avatar focus (head level ~ 3.5 units up)
    const focusPos = this.playerPosition.clone().add(new THREE.Vector3(0, 3.5, 0));

    const cp = Math.cos(this.cameraPitch);
    const sp = Math.sin(this.cameraPitch);
    const cy = Math.sin(this.cameraYaw);
    const sy = Math.cos(this.cameraYaw);

    _camOffset.set(cy * cp, sp, sy * cp).multiplyScalar(this.cameraDistance);
    const targetCamPos = focusPos.clone().add(_camOffset);

    this.camera.position.copy(targetCamPos);
    this.camera.lookAt(focusPos);
  }

  private setupInputs() {
    const el = this.renderer.domElement;

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      this.keys[e.code] = true;

      // Number keys 1-6 for hotbar tools
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
        const slot = parseInt(e.code.replace('Digit', ''), 10);
        const tool = DEFAULT_HOTBAR_TOOLS.find((t) => t.slot === slot) || null;
        this.equipTool(tool);
      }

      // Hotkey 'R' to reset character
      if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        this.triggerDeath();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Controls
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      this.isPointerDown = true;
      lastX = e.clientX;
      lastY = e.clientY;

      // Left click to use active tool or studio placement
      if (e.button === 0) {
        if (this.currentWorldId === 'studio') {
          this.handleStudioRaycast(e.clientX, e.clientY);
        } else {
          this.useEquippedTool();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (this.isPointerDown && (e.buttons === 2 || e.buttons === 1)) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        // Camera rotate
        this.cameraYaw -= dx * 0.006;
        this.cameraPitch = THREE.MathUtils.clamp(
          this.cameraPitch + dy * 0.006,
          -0.2,
          1.3
        );
      }
    };

    const onMouseUp = () => {
      this.isPointerDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetCameraDistance = THREE.MathUtils.clamp(
        this.targetCameraDistance + e.deltaY * 0.015,
        3.5,
        35
      );
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent browser context menu on right click
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);

    // Resize Handler
    const onResize = () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.avatar.dispose();
    this.renderer.dispose();
  }
}
