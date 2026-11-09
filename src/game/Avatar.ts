import * as THREE from 'three';
import { AvatarCustomization } from '../types/blox';
import { getFaceTexture, getShirtTexture, getStudTexture } from '../utils/textures';

// Reusable math objects for zero GC in animation loop
const _tempVec3 = new THREE.Vector3();

export class BloxAvatar {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public torsoMesh: THREE.Mesh;
  public leftArmGroup: THREE.Group;
  public rightArmGroup: THREE.Group;
  public leftLegGroup: THREE.Group;
  public rightLegGroup: THREE.Group;
  public toolSocket: THREE.Group;
  public accessoryGroup: THREE.Group;
  public nameplateSprite: THREE.Sprite;
  public speechBubbleSprite: THREE.Sprite;

  private leftArmMesh: THREE.Mesh;
  private rightArmMesh: THREE.Mesh;
  private leftLegMesh: THREE.Mesh;
  private rightLegMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private faceMesh: THREE.Mesh;

  private customization: AvatarCustomization;
  private animTime: number = 0;
  public currentAnim:
    | 'idle'
    | 'walk'
    | 'jump'
    | 'fall'
    | 'dance'
    | 'wave'
    | 'cheer'
    | 'point'
    | 'flip'
    | 'spin' = 'idle';
  public previewEmote: 'idle' | 'walk' | 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin' | null = null;
  private walkSpeed: number = 0;
  private speechTimeout: number | null = null;
  public backAccessoryGroup: THREE.Group;

  constructor(customization: AvatarCustomization) {
    this.customization = customization;
    this.root = new THREE.Group();

    // The entire avatar is scaled to classic Roblox proportions (total height ~ 5 units)
    // Pivot at bottom center (0, 0, 0 is at avatar's feet)

    // Materials
    const studTex = getStudTexture();

    // 1. TORSO (Width: 2, Height: 2, Depth: 1)
    const torsoGeo = new THREE.BoxGeometry(2, 2, 1);
    const shirtTex = getShirtTexture(customization.shirt);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.torsoColor),
      map: shirtTex,
      roughness: 0.35,
      metalness: 0.05,
    });
    this.torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    this.torsoMesh.position.set(0, 3, 0); // Torso sits at Y=2 to Y=4
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;

    // Back Accessory Socket & Dual Katanas
    this.backAccessoryGroup = new THREE.Group();
    this.backAccessoryGroup.position.set(0, 0, -0.58);
    const sword1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    sword1.rotation.z = Math.PI / 4;
    sword1.castShadow = true;
    this.backAccessoryGroup.add(sword1);

    const goldHilt = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.4, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    goldHilt.position.set(0.9, 0.9, 0);
    goldHilt.rotation.z = Math.PI / 4;
    this.backAccessoryGroup.add(goldHilt);

    this.torsoMesh.add(this.backAccessoryGroup);
    this.root.add(this.torsoMesh);

    // 2. HEAD & NECK
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 4.15, 0); // Above torso

    // Head block (1.25 x 1.25 x 1.25)
    const headGeo = new THREE.BoxGeometry(1.25, 1.25, 1.25);
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.headColor),
      roughness: 0.4,
      metalness: 0.05,
    });
    this.headMesh = new THREE.Mesh(headGeo, headMat);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);

    // Iconic Stud on top of head
    const headStudGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
    const headStudMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.headColor),
      map: studTex,
      roughness: 0.3,
      metalness: 0.05,
    });
    const headStud = new THREE.Mesh(headStudGeo, headStudMat);
    headStud.position.set(0, 0.72, 0);
    headStud.castShadow = true;
    this.headGroup.add(headStud);

    // Face Decal on front (+Z face of head)
    const faceGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const faceTex = getFaceTexture(customization.face);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    this.faceMesh = new THREE.Mesh(faceGeo, faceMat);
    this.faceMesh.position.set(0, 0, 0.635);
    this.headGroup.add(this.faceMesh);

    // Accessory / Hat Group
    this.accessoryGroup = new THREE.Group();
    this.headGroup.add(this.accessoryGroup);
    this.buildAccessory(customization.hat);

    this.root.add(this.headGroup);

    // 3. LEFT ARM (Pivots at left shoulder)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-1.5, 3.8, 0);
    const armGeo = new THREE.BoxGeometry(1, 2, 1);
    const leftArmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.leftArmColor),
      roughness: 0.4,
      metalness: 0.05,
    });
    this.leftArmMesh = new THREE.Mesh(armGeo, leftArmMat);
    this.leftArmMesh.position.set(0, -0.9, 0); // Offset down from shoulder pivot
    this.leftArmMesh.castShadow = true;
    this.leftArmMesh.receiveShadow = true;
    this.leftArmGroup.add(this.leftArmMesh);
    this.root.add(this.leftArmGroup);

    // 4. RIGHT ARM (Pivots at right shoulder, has tool socket)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(1.5, 3.8, 0);
    const rightArmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.rightArmColor),
      roughness: 0.4,
      metalness: 0.05,
    });
    this.rightArmMesh = new THREE.Mesh(armGeo, rightArmMat);
    this.rightArmMesh.position.set(0, -0.9, 0);
    this.rightArmMesh.castShadow = true;
    this.rightArmMesh.receiveShadow = true;
    this.rightArmGroup.add(this.rightArmMesh);

    // Tool Socket in hand (bottom of right arm)
    this.toolSocket = new THREE.Group();
    this.toolSocket.position.set(0, -1.8, 0.4);
    this.rightArmGroup.add(this.toolSocket);

    this.root.add(this.rightArmGroup);

    // 5. LEFT LEG (Pivots at hip)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.5, 2.0, 0);
    const legGeo = new THREE.BoxGeometry(1, 2, 1);
    const leftLegMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.leftLegColor),
      roughness: 0.4,
      metalness: 0.05,
    });
    this.leftLegMesh = new THREE.Mesh(legGeo, leftLegMat);
    this.leftLegMesh.position.set(0, -1.0, 0); // Pivot at hip, feet at Y=0
    this.leftLegMesh.castShadow = true;
    this.leftLegMesh.receiveShadow = true;
    this.leftLegGroup.add(this.leftLegMesh);
    this.root.add(this.leftLegGroup);

    // 6. RIGHT LEG (Pivots at hip)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.5, 2.0, 0);
    const rightLegMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.rightLegColor),
      roughness: 0.4,
      metalness: 0.05,
    });
    this.rightLegMesh = new THREE.Mesh(legGeo, rightLegMat);
    this.rightLegMesh.position.set(0, -1.0, 0);
    this.rightLegMesh.castShadow = true;
    this.rightLegMesh.receiveShadow = true;
    this.rightLegGroup.add(this.rightLegMesh);
    this.root.add(this.rightLegGroup);

    // 7. Floating 3D Nameplate Sprite
    this.nameplateSprite = this.createNameplateSprite(customization.username);
    this.nameplateSprite.position.set(0, 5.8, 0);
    this.root.add(this.nameplateSprite);

    // 8. Floating Speech Bubble Sprite
    this.speechBubbleSprite = this.createSpeechBubbleSprite('');
    this.speechBubbleSprite.position.set(0, 6.8, 0);
    this.speechBubbleSprite.visible = false;
    this.root.add(this.speechBubbleSprite);
  }

  // Build 3D procedural hats and accessories (3-10 parts)
  private buildAccessory(hat: AvatarCustomization['hat']) {
    // Clear any existing children
    while (this.accessoryGroup.children.length > 0) {
      this.accessoryGroup.remove(this.accessoryGroup.children[0]);
    }

    if (hat === 'none') return;

    if (hat === 'fedora') {
      // Classic Sparkle Time / Fedora (Brim, Crown, Ribbon band, and Sparkle pin)
      const hatGroup = new THREE.Group();
      hatGroup.position.set(0, 0.65, 0);

      // Brim
      const brimGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.08, 24);
      const fedoraMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.1,
      });
      const brim = new THREE.Mesh(brimGeo, fedoraMat);
      hatGroup.add(brim);

      // Crown
      const crownGeo = new THREE.CylinderGeometry(0.72, 0.85, 0.6, 24);
      const crown = new THREE.Mesh(crownGeo, fedoraMat);
      crown.position.set(0, 0.32, 0);
      hatGroup.add(crown);

      // Ribbon Band
      const bandGeo = new THREE.CylinderGeometry(0.86, 0.87, 0.15, 24);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Red band
        roughness: 0.4,
        metalness: 0.2,
      });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(0, 0.12, 0);
      hatGroup.add(band);

      // Golden pin accent
      const pinGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        metalness: 0.9,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(0.85, 0.12, 0.2);
      hatGroup.add(pin);

      this.accessoryGroup.add(hatGroup);
    } else if (hat === 'visor') {
      // Classic Translucent Visor
      const visorGroup = new THREE.Group();
      visorGroup.position.set(0, 0.25, 0.65);

      const visorGeo = new THREE.BoxGeometry(1.3, 0.18, 0.7);
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.x = 0.25;
      visorGroup.add(visor);

      // Headband strap around head
      const strapGeo = new THREE.BoxGeometry(1.35, 0.16, 1.35);
      const strapMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
      });
      const strap = new THREE.Mesh(strapGeo, strapMat);
      strap.position.set(0, 0.1, -0.65);
      visorGroup.add(strap);

      this.accessoryGroup.add(visorGroup);
    } else if (hat === 'chef') {
      // Chef Hat
      const chefGroup = new THREE.Group();
      chefGroup.position.set(0, 0.65, 0);

      const baseGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.4, 20);
      const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
      });
      const base = new THREE.Mesh(baseGeo, whiteMat);
      chefGroup.add(base);

      const topGeo = new THREE.SphereGeometry(1.0, 16, 16);
      topGeo.scale(1.0, 0.8, 1.0);
      const top = new THREE.Mesh(topGeo, whiteMat);
      top.position.set(0, 0.7, 0);
      chefGroup.add(top);

      this.accessoryGroup.add(chefGroup);
    } else if (hat === 'valkyrie') {
      // Valkyrie Helm (Golden crown + side winged feathers)
      const valkGroup = new THREE.Group();
      valkGroup.position.set(0, 0.4, 0);

      // Gold band
      const crownGeo = new THREE.CylinderGeometry(0.75, 0.8, 0.35, 20);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.85,
      });
      const crown = new THREE.Mesh(crownGeo, goldMat);
      crown.position.set(0, 0.2, 0);
      valkGroup.add(crown);

      // Center sapphire jewel
      const gemGeo = new THREE.OctahedronGeometry(0.16);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.6,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(0, 0.2, 0.8);
      valkGroup.add(gem);

      // Left & Right feathered wings
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.6,
      });
      const createWing = (side: number) => {
        const wing = new THREE.Group();
        wing.position.set(side * 0.75, 0.3, 0);
        wing.rotation.z = side * -0.3;
        for (let i = 0; i < 4; i++) {
          const featherGeo = new THREE.ConeGeometry(0.12, 0.8 + i * 0.2, 8);
          const feather = new THREE.Mesh(featherGeo, wingMat);
          feather.position.set(side * (i * 0.15), 0.4 + i * 0.15, -i * 0.1);
          feather.rotation.z = side * (0.3 + i * 0.12);
          wing.add(feather);
        }
        return wing;
      };

      valkGroup.add(createWing(1));
      valkGroup.add(createWing(-1));
      this.accessoryGroup.add(valkGroup);
    } else if (hat === 'dominus') {
      // Shrouded Dominus Hood with glowing eyes
      const domGroup = new THREE.Group();
      domGroup.position.set(0, 0.1, 0);

      const hoodGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const hoodMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.8,
        metalness: 0.2,
      });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      domGroup.add(hood);

      // Glowing cyan eyes inside darkness
      const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.35, 0.1, 0.78);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.35, 0.1, 0.78);
      domGroup.add(leftEye);
      domGroup.add(rightEye);

      this.accessoryGroup.add(domGroup);
    } else if (hat === 'baconhair') {
      // Classic Brown layered hair blocks
      const hairGroup = new THREE.Group();
      hairGroup.position.set(0, 0.5, 0);

      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x78350f, // Brown
        roughness: 0.7,
      });

      // Top hair block
      const topGeo = new THREE.BoxGeometry(1.35, 0.45, 1.35);
      const top = new THREE.Mesh(topGeo, hairMat);
      top.position.set(0, 0.2, 0);
      hairGroup.add(top);

      // Side strand
      const strandGeo = new THREE.BoxGeometry(0.35, 0.8, 0.4);
      const strand = new THREE.Mesh(strandGeo, hairMat);
      strand.position.set(0.65, -0.1, 0.2);
      hairGroup.add(strand);

      this.accessoryGroup.add(hairGroup);
    } else if (hat === 'tophat') {
      // Victorian Black Top Hat with gold buckle
      const topHatGroup = new THREE.Group();
      topHatGroup.position.set(0, 0.65, 0);

      const brimGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.08, 24);
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
      const brim = new THREE.Mesh(brimGeo, blackMat);
      topHatGroup.add(brim);

      const cylinderGeo = new THREE.CylinderGeometry(0.8, 0.75, 1.2, 24);
      const cylinder = new THREE.Mesh(cylinderGeo, blackMat);
      cylinder.position.set(0, 0.6, 0);
      topHatGroup.add(cylinder);

      // Gold Ribbon
      const ribbonGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.16, 24);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
      const ribbon = new THREE.Mesh(ribbonGeo, goldMat);
      ribbon.position.set(0, 0.12, 0);
      topHatGroup.add(ribbon);

      this.accessoryGroup.add(topHatGroup);
    } else if (hat === 'antlers') {
      // Golden Festive Antlers
      const antlerGroup = new THREE.Group();
      antlerGroup.position.set(0, 0.65, 0);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 });

      const createAntlerBranch = (side: number) => {
        const b = new THREE.Group();
        b.position.set(side * 0.5, 0, 0);
        // Main horn
        const mGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
        const m = new THREE.Mesh(mGeo, goldMat);
        m.rotation.z = side * -0.4;
        m.position.set(side * 0.3, 0.5, 0);
        b.add(m);
        // Prong
        const pGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8);
        const p = new THREE.Mesh(pGeo, goldMat);
        p.rotation.z = side * -0.8;
        p.position.set(side * 0.5, 0.7, 0.1);
        b.add(p);
        return b;
      };

      antlerGroup.add(createAntlerBranch(1));
      antlerGroup.add(createAntlerBranch(-1));
      this.accessoryGroup.add(antlerGroup);
    } else if (hat === 'crown') {
      // King's Golden Imperial Crown with Rubies
      const crownGroup = new THREE.Group();
      crownGroup.position.set(0, 0.65, 0);

      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.15 });
      const baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.35, 20);
      const base = new THREE.Mesh(baseGeo, goldMat);
      crownGroup.add(base);

      // 5 Crown points with red rubies
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const px = Math.cos(angle) * 0.75;
        const pz = Math.sin(angle) * 0.75;

        const spikeGeo = new THREE.ConeGeometry(0.12, 0.45, 8);
        const spike = new THREE.Mesh(spikeGeo, goldMat);
        spike.position.set(px, 0.35, pz);
        crownGroup.add(spike);

        const rubyGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const rubyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.1 });
        const ruby = new THREE.Mesh(rubyGeo, rubyMat);
        ruby.position.set(px * 1.05, 0.15, pz * 1.05);
        crownGroup.add(ruby);
      }

      this.accessoryGroup.add(crownGroup);
    }
  }

  // Create floating 2D billboard username
  private createNameplateSprite(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Background pill with dark translucency
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Player', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.2, 0.8, 1);
    return sprite;
  }

  // Create floating 3D speech bubble
  private createSpeechBubbleSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    if (text) {
      // Speech bubble body
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(10, 10, 300, 60, 16);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Little triangle pointer at bottom
      ctx.beginPath();
      ctx.moveTo(145, 70);
      ctx.lineTo(160, 90);
      ctx.lineTo(175, 70);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text inside
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayText = text.length > 24 ? text.substring(0, 22) + '...' : text;
      ctx.fillText(displayText, 160, 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.0, 1.25, 1);
    return sprite;
  }

  public showSpeech(text: string) {
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;

    // White rounded speech bubble
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(10, 10, 300, 60, 16);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Triangle tail
    ctx.beginPath();
    ctx.moveTo(145, 70);
    ctx.lineTo(160, 92);
    ctx.lineTo(175, 70);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(145, 70);
    ctx.lineTo(160, 92);
    ctx.lineTo(175, 70);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayText = text.length > 24 ? text.substring(0, 22) + '...' : text;
    ctx.fillText(displayText, 160, 40);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.speechBubbleSprite.material.map?.dispose();
    this.speechBubbleSprite.material.map = texture;
    this.speechBubbleSprite.material.needsUpdate = true;
    this.speechBubbleSprite.visible = true;

    this.speechTimeout = window.setTimeout(() => {
      this.speechBubbleSprite.visible = false;
    }, 4500);
  }

  public updateCustomization(newCustom: AvatarCustomization) {
    this.customization = newCustom;

    // Head
    (this.headMesh.material as THREE.MeshStandardMaterial).color.set(newCustom.headColor);
    // Face
    const faceTex = getFaceTexture(newCustom.face);
    (this.faceMesh.material as THREE.MeshBasicMaterial).map = faceTex;
    (this.faceMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;

    // Torso & Shirt
    const shirtTex = getShirtTexture(newCustom.shirt);
    const torsoMat = this.torsoMesh.material as THREE.MeshStandardMaterial;
    torsoMat.color.set(newCustom.torsoColor);
    torsoMat.map = shirtTex;
    torsoMat.needsUpdate = true;

    // Limbs
    (this.leftArmMesh.material as THREE.MeshStandardMaterial).color.set(newCustom.leftArmColor);
    (this.rightArmMesh.material as THREE.MeshStandardMaterial).color.set(newCustom.rightArmColor);
    (this.leftLegMesh.material as THREE.MeshStandardMaterial).color.set(newCustom.leftLegColor);
    (this.rightLegMesh.material as THREE.MeshStandardMaterial).color.set(newCustom.rightLegColor);

    // Hats
    this.buildAccessory(newCustom.hat);

    // Nameplate
    const newNameplate = this.createNameplateSprite(newCustom.username);
    this.nameplateSprite.material.map?.dispose();
    this.nameplateSprite.material.map = newNameplate.material.map;
    this.nameplateSprite.material.needsUpdate = true;
  }

  /**
   * Smooth physics & kinematics animation update.
   */
  public update(delta: number, isMoving: boolean, speed: number, isGrounded: boolean, yVelocity: number) {
    this.animTime += delta;
    this.walkSpeed = THREE.MathUtils.damp(this.walkSpeed, speed, 8, delta);

    // Determine state
    if (this.previewEmote) {
      this.currentAnim = this.previewEmote;
    } else if (!isGrounded) {
      if (yVelocity > 1) {
        this.currentAnim = 'jump';
      } else {
        this.currentAnim = 'fall';
      }
    } else if (isMoving) {
      this.root.rotation.x = 0;
      this.currentAnim = 'walk';
    } else if (['dance', 'wave', 'cheer', 'point', 'flip', 'spin'].includes(this.currentAnim)) {
      // Keep emote until interrupted by movement or jump
    } else {
      this.root.rotation.x = 0;
      this.currentAnim = 'idle';
    }

    const t = this.animTime;

    if (this.currentAnim === 'flip') {
      // 360-degree acrobatic backflip
      const flipCycle = (t * 5.0) % (Math.PI * 2);
      this.root.rotation.x = -flipCycle;
      this.torsoMesh.position.y = 3.0 + Math.sin(flipCycle) * 1.5;
      this.leftArmGroup.rotation.x = -Math.PI * 0.8;
      this.rightArmGroup.rotation.x = -Math.PI * 0.8;
      this.leftLegGroup.rotation.x = 0.4;
      this.rightLegGroup.rotation.x = 0.4;
    } else if (this.currentAnim === 'spin') {
      this.root.rotation.x = 0;
      this.root.rotation.y += delta * 12;
      this.leftArmGroup.rotation.z = 1.2;
      this.rightArmGroup.rotation.z = -1.2;
      this.torsoMesh.position.y = 3.0 + Math.abs(Math.sin(t * 8)) * 0.2;
    } else if (this.currentAnim === 'walk') {
      // Classic Roblox arm & leg swing (synchronous pendulum)
      const walkFreq = 9.0;
      const legAngle = Math.sin(t * walkFreq) * 0.75;
      const armAngle = -legAngle;

      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = armAngle;

      // If holding a tool, right arm stays partially angled forward
      if (this.toolSocket.children.length > 0) {
        this.rightArmGroup.rotation.x = -Math.PI / 3 + armAngle * 0.2;
      } else {
        this.rightArmGroup.rotation.x = -armAngle;
      }

      this.leftArmGroup.rotation.z = 0.05;
      this.rightArmGroup.rotation.z = -0.05;

      // Slight torso bounce
      this.torsoMesh.position.y = 3.0 + Math.abs(Math.sin(t * walkFreq * 2)) * 0.12;
      this.headGroup.position.y = 4.15 + Math.abs(Math.sin(t * walkFreq * 2)) * 0.12;
      this.headGroup.rotation.y = Math.sin(t * walkFreq) * 0.08;
    } else if (this.currentAnim === 'jump') {
      // Classic jump pose: both arms angled up forward
      this.leftArmGroup.rotation.x = -Math.PI / 2.2;
      this.rightArmGroup.rotation.x = -Math.PI / 2.2;
      this.leftLegGroup.rotation.x = -0.3;
      this.rightLegGroup.rotation.x = 0.2;
      this.torsoMesh.position.y = 3.0;
      this.headGroup.position.y = 4.15;
    } else if (this.currentAnim === 'fall') {
      // Falling pose: arms spread out slightly
      this.leftArmGroup.rotation.x = -0.5;
      this.leftArmGroup.rotation.z = 0.4;
      this.rightArmGroup.rotation.x = -0.5;
      this.rightArmGroup.rotation.z = -0.4;
      this.leftLegGroup.rotation.x = 0.4;
      this.rightLegGroup.rotation.x = -0.4;
    } else if (this.currentAnim === 'dance') {
      // Classic Roblox /e dance disco rhythm!
      const danceFreq = 6.0;
      const beat = Math.sin(t * danceFreq);
      this.leftArmGroup.rotation.z = 0.5 + beat * 0.5;
      this.rightArmGroup.rotation.z = -0.5 - beat * 0.5;
      this.leftArmGroup.rotation.x = Math.cos(t * danceFreq) * 0.8;
      this.rightArmGroup.rotation.x = -Math.cos(t * danceFreq) * 0.8;
      this.leftLegGroup.rotation.x = Math.sin(t * danceFreq) * 0.4;
      this.rightLegGroup.rotation.x = -Math.sin(t * danceFreq) * 0.4;
      this.headGroup.rotation.y = Math.sin(t * danceFreq * 0.5) * 0.4;
      this.torsoMesh.position.y = 3.0 + Math.abs(beat) * 0.2;
    } else if (this.currentAnim === 'wave') {
      // Right arm raised, waving hand
      this.rightArmGroup.rotation.x = -Math.PI * 0.85;
      this.rightArmGroup.rotation.z = -0.2 + Math.sin(t * 8.0) * 0.35;
      this.leftArmGroup.rotation.x = 0.05;
      this.leftArmGroup.rotation.z = 0.05;
      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.torsoMesh.position.y = 3.0;
    } else if (this.currentAnim === 'cheer') {
      // Both arms up, jumping with joy
      const cheerFreq = 7.0;
      this.leftArmGroup.rotation.x = -Math.PI * 0.9;
      this.rightArmGroup.rotation.x = -Math.PI * 0.9;
      this.leftArmGroup.rotation.z = 0.3 + Math.sin(t * cheerFreq) * 0.2;
      this.rightArmGroup.rotation.z = -0.3 - Math.sin(t * cheerFreq) * 0.2;
      this.torsoMesh.position.y = 3.0 + Math.abs(Math.sin(t * cheerFreq)) * 0.3;
    } else if (this.currentAnim === 'point') {
      // Right arm straight forward pointing
      this.rightArmGroup.rotation.x = -Math.PI / 2;
      this.rightArmGroup.rotation.z = 0;
      this.leftArmGroup.rotation.x = 0;
      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.torsoMesh.position.y = 3.0;
    } else {
      // IDLE: subtle breathing sway
      const idleFreq = 2.0;
      const sway = Math.sin(t * idleFreq);
      this.torsoMesh.position.y = 3.0 + sway * 0.03;
      this.headGroup.position.y = 4.15 + sway * 0.03;

      if (this.toolSocket.children.length > 0) {
        // Holding tool
        this.rightArmGroup.rotation.x = -Math.PI / 3;
        this.rightArmGroup.rotation.z = -0.05;
      } else {
        this.rightArmGroup.rotation.x = sway * 0.04;
        this.rightArmGroup.rotation.z = -0.05;
      }

      this.leftArmGroup.rotation.x = -sway * 0.04;
      this.leftArmGroup.rotation.z = 0.05;
      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.headGroup.rotation.y = 0;
    }
  }

  // Set preview animation for Avatar Editor
  public setPreviewAnimation(anim: 'idle' | 'walk' | 'dance' | 'wave' | 'cheer' | 'point' | 'flip' | 'spin' | null) {
    this.previewEmote = anim;
    if (anim) {
      this.currentAnim = anim;
      if (anim === 'idle') {
        this.root.rotation.x = 0;
      }
    }
  }

  // Play quick slash animation for sword
  public triggerToolSwing() {
    this.rightArmGroup.rotation.x = -Math.PI * 0.7;
    setTimeout(() => {
      this.rightArmGroup.rotation.x = -0.2;
      setTimeout(() => {
        this.rightArmGroup.rotation.x = -Math.PI / 3;
      }, 150);
    }, 120);
  }

  public dispose() {
    this.nameplateSprite.material.map?.dispose();
    this.nameplateSprite.material.dispose();
    this.speechBubbleSprite.material.map?.dispose();
    this.speechBubbleSprite.material.dispose();
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
  }
}
