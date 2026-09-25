// Web Audio Ambient Synthesizer for Brown Noise, Rain, and White Noise
import { AmbientSoundType } from '../types';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: AmbientSoundType = 'none';
  private volume: number = 0.4;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  public stop() {
    if (this.currentSource) {
      try {
        (this.currentSource as any).stop?.();
        this.currentSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.currentSource = null;
    }
    this.currentType = 'none';
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'none') return;

    const ctx = this.initContext();
    if (!ctx || !this.gainNode) return;

    this.currentType = type;

    // Buffer duration: 5 seconds looped seamlessly
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(this.gainNode);
      noise.start();
      this.currentSource = noise;
    } else if (type === 'brown') {
      // Brown noise (integrated white noise)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }
      // Apply Lowpass filter for deep rumbling brown noise
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.currentSource = noise;
    } else if (type === 'rain') {
      // Rain simulation: filtered pink noise with random drop modulation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
        // occasional rain patter surge
        const surge = Math.random() > 0.998 ? 1.4 : 1.0;
        data[i] = pink * surge;
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, ctx.currentTime);

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.currentSource = noise;
    }
  }
}

export const ambientEngine = new AmbientSoundEngine();
