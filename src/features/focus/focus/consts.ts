import { AmbientSoundType } from "../../../types"

export const DEFAULT_FOCUS_MINUTES = 10

export const AMBIENT_SOUND_TYPES: AmbientSoundType[] = ["none", "brown", "rain", "white"]

export const AMBIENT_SOUND_LABELS: Record<AmbientSoundType, string> = {
  none: "Off",
  brown: "Brown Noise",
  rain: "Rain",
  white: "White Noise",
}

export const FOCUS_COMPLETE_CONFETTI = {
  particleCount: 60,
  spread: 70,
  origin: { y: 0.6 },
  colors: ["#F59E0B", "#10B981", "#6366F1", "#EC4899"],
}
