import { ALL_AREAS } from "./consts"

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function buildUntanglePayload(text: string, focusCategory: string): string {
  if (focusCategory === ALL_AREAS) return text
  return `[Priority Area: ${focusCategory}] ${text}`
}
