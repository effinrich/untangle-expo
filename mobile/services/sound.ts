import { Platform } from 'react-native'

/** DESIGN_SYSTEM: completion chime C5–E5–G5 */
const COMPLETION_CHIME_FREQS = [523.25, 659.25, 783.99] as const

/** DESIGN_SYSTEM: micro-step tick ~784 Hz */
const TICK_FREQ_HZ = 784

function getBrowserAudioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as typeof window & {
    webkitAudioContext?: typeof AudioContext
  }
  return w.AudioContext ?? w.webkitAudioContext
}

// Web Audio API on web; no-op on native (Expo Go has no DOM AudioContext)
class SoundService {
  private ctx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (Platform.OS !== 'web') return null

    const AudioCtx = getBrowserAudioContextCtor()
    if (!AudioCtx) return null

    if (!this.ctx) {
      this.ctx = new AudioCtx()
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // Browser autoplay policy — resumes on the next user gesture
      })
    }

    return this.ctx
  }

  playCompletionChime(): void {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    COMPLETION_CHIME_FREQS.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)

      gain.gain.setValueAtTime(0, now + idx * 0.06)
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.65)
    })
  }

  playTick(): void {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(TICK_FREQ_HZ, now)
    osc.frequency.exponentialRampToValueAtTime(392, now + 0.05)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  }

  playFocusStart(): void {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const freqs = [440, 659.25, 880] as const

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.3)
    })
  }
}

export const soundService = new SoundService()
