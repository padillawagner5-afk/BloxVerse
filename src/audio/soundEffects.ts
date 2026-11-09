/**
 * Procedural Web Audio API sound synthesizer for BloxVerse.
 * 100% procedural with zero external audio assets.
 */

class BloxAudioManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.6;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // The iconic "OOF!" sound
  playOof() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Master gain for this sound
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.7 * this.volume, now);
      master.gain.linearRampToValueAtTime(0, now + 0.35);
      master.connect(ctx.destination);

      // Formant oscillator 1 (Throat pitch)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      // Formant filter for vocal "oo-ff"
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.25);
      filter.Q.setValueAtTime(4.0, now);

      osc1.connect(filter);
      filter.connect(master);

      // Transient pop
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(320, now);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.15);
      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.5, now);
      popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc2.connect(popGain);
      popGain.connect(master);

      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now);
      osc2.stop(now + 0.15);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Jumping boing
  playJump() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.16);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Super spring coil jump
  playCoilBoing() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.25);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Step click
  playStep() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Coin / Cash collect chime
  playCoin() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      };

      playTone(987.77, now); // B5
      playTone(1318.51, now + 0.08); // E6
    } catch {}
  }

  // Place brick click
  playPlaceBrick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Delete brick pop
  playDeleteBrick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // Sword slash whoosh
  playSwordSwing() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Noise buffer for whoosh
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {}
  }

  // Sword hit clang
  playSwordClang() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      [1200, 1540, 2100].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch {}
  }

  // Rocket fire launch
  playRocketLaunch() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.3);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Rocket explosion
  playExplosion() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Sub-boom
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
      oscGain.gain.setValueAtTime(0.7 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);

      // Noise blast
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.38);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
    } catch {}
  }

  // Bloxy Cola sip & gulp
  playBloxyCola() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Can tab pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.5 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      // Gulp
      setTimeout(() => {
        try {
          const now2 = ctx.currentTime;
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(280, now2);
          osc2.frequency.exponentialRampToValueAtTime(120, now2 + 0.16);
          gain2.gain.setValueAtTime(0.4 * this.volume, now2);
          gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.16);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now2);
          osc2.stop(now2 + 0.18);
        } catch {}
      }, 120);
    } catch {}
  }

  // Victory / Stage Clear Fanfare
  playVictory() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const notes = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.12 }, // E5
        { f: 783.99, t: 0.24 }, // G5
        { f: 1046.5, t: 0.38 }, // C6
      ];

      notes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.35 * this.volume, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.38);
      });
    } catch {}
  }
}

export const bloxAudio = new BloxAudioManager();
