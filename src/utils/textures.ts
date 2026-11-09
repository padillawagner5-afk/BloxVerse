import * as THREE from 'three';

// Cache generated textures so we don't recreate them every frame
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates the classic Roblox cylindrical "Stud" texture on top of bricks.
 */
export function getStudTexture(): THREE.CanvasTexture {
  const key = 'stud_standard';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Neutral grey plastic background
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, 0, 128, 128);

  // Subtle grid bevel outline
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 126, 126);

  // Draw 2x2 studs grid on each tile
  const studPositions = [
    { x: 32, y: 32 },
    { x: 96, y: 32 },
    { x: 32, y: 96 },
    { x: 96, y: 96 },
  ];

  studPositions.forEach(({ x, y }) => {
    // Drop shadow
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fill();

    // Stud outer circle
    const grad = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 20);
    grad.addColorStop(0, '#f2f2f2');
    grad.addColorStop(0.5, '#dddddd');
    grad.addColorStop(1, '#aaaaaa');
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stud top rim highlight
    ctx.beginPath();
    ctx.arc(x, y - 1, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Inner embossed ROBLOX-style center ring
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates procedural classic and meme Roblox faces.
 */
export function getFaceTexture(faceType: string): THREE.CanvasTexture {
  const key = `face_${faceType}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Transparent background so skin color shows through
  ctx.clearRect(0, 0, 256, 256);

  ctx.fillStyle = '#111111';
  ctx.strokeStyle = '#111111';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (faceType === 'chill') {
    // Chill face with cool shades and smirk
    ctx.fillStyle = '#111827';
    // Sunglasses frames
    ctx.beginPath();
    ctx.roundRect(40, 70, 70, 48, 8);
    ctx.roundRect(146, 70, 70, 48, 8);
    ctx.fill();
    // Bridge
    ctx.fillRect(108, 82, 40, 10);
    // Tint sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(50, 75);
    ctx.lineTo(85, 75);
    ctx.lineTo(60, 110);
    ctx.lineTo(45, 110);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(156, 75);
    ctx.lineTo(191, 75);
    ctx.lineTo(166, 110);
    ctx.lineTo(151, 110);
    ctx.fill();

    // Smirk
    ctx.beginPath();
    ctx.arc(140, 160, 40, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 8;
    ctx.stroke();
  } else if (faceType === 'epic') {
    // Epic face: iconic wide open eyes and teethy grin
    // Big round eyes
    ctx.beginPath();
    ctx.arc(75, 85, 30, 0, Math.PI * 2);
    ctx.arc(181, 85, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Big pupils
    ctx.beginPath();
    ctx.arc(80, 85, 16, 0, Math.PI * 2);
    ctx.arc(176, 85, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Eye shines
    ctx.beginPath();
    ctx.arc(85, 80, 5, 0, Math.PI * 2);
    ctx.arc(181, 80, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Wide crescent mouth
    ctx.beginPath();
    ctx.arc(128, 140, 68, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();
    // Tongue
    ctx.beginPath();
    ctx.arc(128, 185, 32, Math.PI, 0, false);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  } else if (faceType === 'winning') {
    // Winning Smile: wide open mouth with teeth
    // Eyes
    ctx.beginPath();
    ctx.ellipse(75, 80, 12, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(181, 80, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();

    // Wide mouth
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.quadraticCurveTo(128, 210, 206, 140);
    ctx.quadraticCurveTo(128, 150, 50, 140);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.stroke();

    // Teeth line
    ctx.beginPath();
    ctx.moveTo(52, 148);
    ctx.quadraticCurveTo(128, 175, 204, 148);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (faceType === 'beast') {
    // Angry / Beast face with red eyes and fangs
    // Angular eyes
    ctx.beginPath();
    ctx.moveTo(55, 65);
    ctx.lineTo(100, 85);
    ctx.lineTo(60, 95);
    ctx.closePath();
    ctx.moveTo(201, 65);
    ctx.lineTo(156, 85);
    ctx.lineTo(196, 95);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.stroke();

    // Snarl mouth
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(196, 160);
    ctx.lineTo(180, 190);
    ctx.lineTo(76, 190);
    ctx.closePath();
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(85, 160);
    ctx.lineTo(95, 175);
    ctx.lineTo(105, 160);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(151, 160);
    ctx.lineTo(161, 175);
    ctx.lineTo(171, 160);
    ctx.fill();
  } else if (faceType === 'joy') {
    // Joy / Cheerful open eyes with pink blush
    ctx.beginPath();
    ctx.arc(75, 85, 14, 0, Math.PI * 2);
    ctx.arc(181, 85, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Shines
    ctx.beginPath();
    ctx.arc(78, 80, 5, 0, Math.PI * 2);
    ctx.arc(184, 80, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // Blush
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.ellipse(60, 105, 12, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(196, 105, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cute smile
    ctx.beginPath();
    ctx.arc(128, 125, 40, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 8;
    ctx.stroke();
  } else if (faceType === 'cyborg') {
    // Cyborg Robot Face
    ctx.fillStyle = '#64748b';
    ctx.fillRect(30, 40, 196, 176);
    // Left eye normal
    ctx.beginPath();
    ctx.arc(80, 85, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Right eye glowing laser red HUD
    ctx.beginPath();
    ctx.arc(176, 85, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(176, 85, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    // Metal grill mouth
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(70, 140, 116, 30);
    ctx.fillStyle = '#94a3b8';
    for (let x = 76; x < 180; x += 16) {
      ctx.fillRect(x, 144, 8, 22);
    }
  } else if (faceType === 'cool') {
    // Cool Gold Aviator Shades & Smirk
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(40, 70, 76, 44, 8);
    ctx.roundRect(140, 70, 76, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(116, 80);
    ctx.lineTo(140, 80);
    ctx.stroke();
    // Smirk
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.quadraticCurveTo(140, 155, 175, 135);
    ctx.stroke();
  } else if (faceType === 'star') {
    // Starry Eyes with big radiant smile
    const drawStar = (cx: number, cy: number, spikes: number, outer: number, inner: number) => {
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outer);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
        rot += step;
      }
      ctx.closePath();
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.stroke();
    };
    drawStar(75, 85, 5, 26, 12);
    drawStar(181, 85, 5, 26, 12);
    // Big open happy mouth
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(128, 130, 42, 0, Math.PI, false);
    ctx.fill();
    // Pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(128, 155, 20, 0, Math.PI, false);
    ctx.fill();
  } else {
    // Default: The legendary Classic Roblox Smile :)
    // Left eye (two stacked dots / rounded oval)
    ctx.beginPath();
    ctx.ellipse(80, 85, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(176, 85, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iconic thick curved smile
    ctx.beginPath();
    ctx.arc(128, 130, 48, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates procedural shirt decals for torso.
 */
export function getShirtTexture(shirtType: string): THREE.CanvasTexture {
  const key = `shirt_${shirtType}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  if (shirtType === 'classic') {
    // Classic Roblox "R" Logo T-Shirt
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, 256, 256);

    // Collar
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.arc(128, 0, 45, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(128, 0, 36, 0, Math.PI);
    ctx.fill();

    // Red square Roblox logo tilted
    ctx.save();
    ctx.translate(128, 128);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-42, -42, 84, 84, 8);
    ctx.fill();

    // Inner tilt square hole
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 28, 4);
    ctx.fill();
    ctx.restore();
  } else if (shirtType === 'tuxedo') {
    // Fancy Black Tuxedo with White Shirt & Red Bowtie
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 256);

    // White shirt triangle
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(176, 0);
    ctx.lineTo(128, 170);
    ctx.closePath();
    ctx.fill();

    // Red Bowtie
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(110, 40);
    ctx.lineTo(146, 55);
    ctx.lineTo(146, 25);
    ctx.lineTo(110, 40);
    ctx.lineTo(110, 25);
    ctx.lineTo(110, 55);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(128, 40, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tuxedo Buttons
    ctx.fillStyle = '#334155';
    [75, 105, 135].forEach((y) => {
      ctx.beginPath();
      ctx.arc(128, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lapel fold lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(128, 170);
    ctx.lineTo(176, 0);
    ctx.stroke();
  } else if (shirtType === 'builder') {
    // Blox Builder: orange safety harness / builder overalls
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, 0, 256, 256);

    // Reflective yellow cross stripes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(40, 0, 24, 256);
    ctx.fillRect(192, 0, 24, 256);
    ctx.fillRect(0, 160, 256, 24);

    // Silver reflective tape inside stripes
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(46, 0, 12, 256);
    ctx.fillRect(198, 0, 12, 256);
    ctx.fillRect(0, 166, 256, 12);

    // Pocket with wrench tool icon
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.roundRect(75, 80, 50, 55, 6);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('🛠', 88, 115);
  } else if (shirtType === 'stripes') {
    // Retro Striped Tee (green & white)
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#f0fdf4';
    for (let y = 20; y < 256; y += 40) {
      ctx.fillRect(0, y, 256, 18);
    }
  } else if (shirtType === 'hoodie') {
    // Cool Black Streetwear Hoodie with White Drawstrings
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, 256, 256);
    // Hood collar
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(128, 0, 55, 0, Math.PI);
    ctx.fill();
    // Kangaroo pocket
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(40, 140, 176, 80, 14);
    ctx.fill();
    // White drawstrings
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(110, 20);
    ctx.lineTo(110, 110);
    ctx.moveTo(146, 20);
    ctx.lineTo(146, 110);
    ctx.stroke();
  } else if (shirtType === 'galaxy') {
    // Cosmic Nebula Galaxy Shirt
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#3b0764');
    grad.addColorStop(0.5, '#4338ca');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37) % 256;
      const sy = (i * 59) % 256;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Default Noob: Bright Sky Blue torso with subtle shading
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 256, 256);

    // Collar
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(128, 0, 40, 0, Math.PI);
    ctx.fill();

    // Classic ROBLOX chest text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROBLOX', 128, 120);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates dynamic Skybox gradient background for Roblox worlds.
 */
export function createRobloxSkyTexture(): THREE.CanvasTexture {
  const key = 'roblox_sky';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#38bdf8'); // Bright sky blue
  grad.addColorStop(0.65, '#bae6fd'); // Atmospheric haze
  grad.addColorStop(0.85, '#e0f2fe'); // Horizon glow
  grad.addColorStop(1, '#94a3b8'); // Distant terrain haze
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft cartoon clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const drawCloud = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx + r * 1.4, cy, r * 0.7, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy + r * 0.3, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
  };

  drawCloud(100, 140, 35);
  drawCloud(340, 190, 45);
  drawCloud(220, 90, 25);
  drawCloud(460, 120, 30);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}
