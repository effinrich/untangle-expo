import React from "react"

// The product mark: a four-point sparkle, amber on obsidian. The geometry
// mirrors the splash art, where the star measures a symmetric 381x381 astroid
// above the wordmark. Inset from the viewBox so the points are not clipped.
export const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
    <path
      d="M50 8 C54 38 62 46 92 50 C62 54 54 62 50 92 C46 62 38 54 8 50 C38 46 46 38 50 8 Z"
      fill="currentColor"
    />
  </svg>
)
