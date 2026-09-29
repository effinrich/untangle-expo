// Native color tokens, shared by tailwind.config.js (NativeWind) and TS code (icons, navigation).
// Contrast is WCAG 2.2 vs the darkest surface each is used on: text >= 4.5:1, UI borders/shapes >= 3:1.
module.exports = {
  canvas: "#0a0a0a",
  surface: "#171717",
  field: "#1f1f1f",
  raised: "#262626",
  divider: "#2e2e2e", // decorative separators only, never the sole boundary of a control

  "text-primary": "#f5f5f5", // 15.1:1 on field
  "text-secondary": "#c4c4c4", // 8.7:1 on raised
  "text-tertiary": "#a3a3a3", // 6.0:1 on raised; placeholders

  "border-field": "#8a8a8a", // 4.8:1 on field
  "border-control": "#737373", // 3.2:1 on raised

  accent: "#fbbf24", // primary buttons; 11.9:1 vs canvas
  "on-accent": "#0a0a0a", // 11.9:1 on accent
  "accent-text": "#fcd34d", // 10.5:1 on raised
  "accent-muted": "#3a2e10", // selected rows; accent-text on it 9.2:1

  success: "#34d399", // 7.9:1 on raised
  "on-success": "#0a0a0a", // 10.3:1 on success
  danger: "#fb7185", // 5.6:1 on raised
  "danger-text": "#fda4af", // 8.9:1 on danger-muted
  "danger-muted": "#3b0d14",
}
