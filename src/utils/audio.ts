import { SoundProfile } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;
  private profile: SoundProfile = 'cherry_blue';

  constructor() {
    // Lazy initialize AudioContext on first user interaction
    const savedProfile = localStorage.getItem('typing_sound_profile') as SoundProfile;
    if (savedProfile) {
      this.profile = savedProfile;
    }
    const savedVol = localStorage.getItem('typing_sound_volume');
    if (savedVol !== null) {
      this.volume = parseFloat(savedVol);
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
    localStorage.setItem('typing_sound_profile', profile);
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('typing_sound_volume', this.volume.toString());
  }

  public getVolume(): number {
    return this.volume;
  }

  public playKey(key: string, isSpaceOrEnter: boolean = false) {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      if (this.profile === 'cherry_blue') {
        this.playCherryBlue(now, isSpaceOrEnter);
      } else if (this.profile === 'cherry_brown') {
        this.playCherryBrown(now, isSpaceOrEnter);
      } else if (this.profile === 'cherry_red') {
        this.playCherryRed(now, isSpaceOrEnter);
      } else if (this.profile === 'cyber_laser') {
        this.playCyberLaser(now, isSpaceOrEnter);
      } else if (this.profile === 'typewriter') {
        this.playTypewriter(now, isSpaceOrEnter);
      }
    } catch {
      // Audio autoplay or security restriction ignored safely
    }
  }

  public playError() {
    if (this.profile === 'off' || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Safely ignore
    }
  }

  private playCherryBlue(now: number, isSpace: boolean) {
    if (!this.ctx) return;
    // Click leaf (high frequency snappy pop)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(isSpace ? 2800 : 3500 + Math.random() * 400, now);
    clickFilter.Q.setValueAtTime(3, now);

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, now);

    clickGain.gain.setValueAtTime(this.volume * 0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // Bottom-out thock (hollow housing resonance)
    const thockOsc = this.ctx.createOscillator();
    const thockGain = this.ctx.createGain();
    const thockFilter = this.ctx.createBiquadFilter();

    thockFilter.type = 'lowpass';
    thockFilter.frequency.setValueAtTime(isSpace ? 500 : 750 + Math.random() * 80, now);

    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(isSpace ? 260 : 380 + Math.random() * 40, now);
    thockOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    thockGain.gain.setValueAtTime(this.volume * 0.45, now + 0.005);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    thockOsc.connect(thockFilter);
    thockFilter.connect(thockGain);
    thockGain.connect(this.ctx.destination);

    thockOsc.start(now + 0.005);
    thockOsc.stop(now + 0.065);
  }

  private playCherryBrown(now: number, isSpace: boolean) {
    if (!this.ctx) return;
    // Tactile bump thock
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSpace ? 480 : 620, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSpace ? 220 : 320 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.045);

    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  private playCherryRed(now: number, isSpace: boolean) {
    if (!this.ctx) return;
    // Smooth linear muffled thock
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSpace ? 190 : 260 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playCyberLaser(now: number, isSpace: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = isSpace ? 1200 : 700 + Math.random() * 400;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  private playTypewriter(now: number, isSpaceOrEnter: boolean) {
    if (!this.ctx) return;

    // Metallic hammer clack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    osc.type = 'square';
    osc.frequency.setValueAtTime(450 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

    // If space or enter, add the classic vintage carriage return BELL "Ding!"
    if (isSpaceOrEnter) {
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(2200, now + 0.02);

      bellGain.gain.setValueAtTime(this.volume * 0.4, now + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      bellOsc.connect(bellGain);
      bellGain.connect(this.ctx.destination);

      bellOsc.start(now + 0.02);
      bellOsc.stop(now + 0.42);
    }
  }

  public playSuccessBell() {
    if (this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.exponentialRampToValueAtTime(2637, now + 0.1); // E7

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio fallback
    }
  }
}

export const soundEngine = new SoundEngine();
