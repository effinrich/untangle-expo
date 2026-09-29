import colors from "../../theme/colors"
import { ButtonSize, ButtonVariant } from "./types"

export const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  success: "bg-success",
  secondary: "bg-raised border border-border-control",
  ghost: "bg-transparent",
}

export const LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-on-accent",
  success: "text-on-success",
  secondary: "text-text-primary",
  ghost: "text-accent-text",
}

export const ICON_COLORS: Record<ButtonVariant, string> = {
  primary: colors["on-accent"],
  success: colors["on-success"],
  secondary: colors["text-primary"],
  ghost: colors["accent-text"],
}

export const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-control px-4 rounded-xl",
  lg: "min-h-cta px-6 rounded-2xl",
}

export const LABEL_SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "text-callout",
  lg: "text-body",
}

export const DISABLED_CONTAINER = "bg-raised border border-divider"
export const DISABLED_LABEL = "text-text-tertiary"
