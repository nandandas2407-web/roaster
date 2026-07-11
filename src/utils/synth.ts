// Web Audio API Synthesizer for high-end tactical sound design.
// Generates premium procedural sound effects directly in the browser.

class SoundSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopHum();
    }
  }

  getMute() {
    return this.isMuted;
  }

  // Tactical subtle click for button hovers
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Sweep sound when commencing analysis
  playAnalysisStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 1.2);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 1.4);
    osc2.stop(this.ctx.currentTime + 1.4);
  }

  // Satisfying physical slam sound when rubber stamp triggers
  playStamp(intensity: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub thump (Heavy impact)
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    
    thump.type = "sine";
    thump.frequency.setValueAtTime(150, now);
    thump.frequency.exponentialRampToValueAtTime(45, now + 0.3);

    let baseVol = 0.3;
    let decayTime = 0.4;
    
    if (intensity === "MILD") {
      baseVol = 0.15;
      decayTime = 0.25;
    } else if (intensity === "NUCLEAR") {
      baseVol = 0.45;
      decayTime = 0.6;
    } else if (intensity === "BRUTAL") {
      baseVol = 0.6;
      decayTime = 0.8;
    }

    thumpGain.gain.setValueAtTime(baseVol, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

    thump.connect(thumpGain);
    thumpGain.connect(this.ctx.destination);
    thump.start();
    thump.stop(now + decayTime + 0.1);

    // Mechanical "clank" or snap
    const clank = this.ctx.createOscillator();
    const clankGain = this.ctx.createGain();
    clank.type = "triangle";
    clank.frequency.setValueAtTime(intensity === "BRUTAL" ? 180 : 320, now);
    clank.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    
    clankGain.gain.setValueAtTime(baseVol * 0.4, now);
    clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    clank.connect(clankGain);
    clankGain.connect(this.ctx.destination);
    clank.start();
    clank.stop(now + 0.2);

    // White noise / Sizzle for Nuclear and Brutal
    if (intensity === "NUCLEAR" || intensity === "BRUTAL") {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = intensity === "BRUTAL" ? 600 : 1200;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(intensity === "BRUTAL" ? 0.15 : 0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start();
      noise.stop(now + 0.4);
    }
  }

  // Background ominous/suspense electrical hum for high intensity modes
  startHum(intensity: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.stopHum();

    const now = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    if (intensity === "NUCLEAR") {
      this.ambientOsc.type = "triangle";
      this.ambientOsc.frequency.setValueAtTime(60, now); // Ominous AC Hum (60Hz)
      this.ambientGain.gain.setValueAtTime(0.005, now);
    } else if (intensity === "BRUTAL") {
      this.ambientOsc.type = "sawtooth";
      this.ambientOsc.frequency.setValueAtTime(55, now); // Absolute low G hum
      this.ambientGain.gain.setValueAtTime(0.012, now);
      
      // Add a slight frequency modulation (vibrato) for distress
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 3; // 3Hz wobble
      lfoGain.gain.value = 2; // +/- 2Hz fluctuation
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientOsc.frequency);
      lfo.start();
    } else {
      this.ambientOsc.type = "sine";
      this.ambientOsc.frequency.setValueAtTime(80, now);
      this.ambientGain.gain.setValueAtTime(0.002, now);
    }

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    this.ambientOsc.start();
  }

  stopHum() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
      } catch (e) {}
      this.ambientOsc.disconnect();
      this.ambientOsc = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
}

export const synth = new SoundSynth();
