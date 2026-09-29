import type { LucideIcon } from "lucide-react-native"

export type ButtonVariant = "primary" | "success" | "secondary" | "ghost"
export type ButtonSize = "md" | "lg"

export interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  className?: string
}
