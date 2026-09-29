import { ApiErrorKind } from "../../services/api-client"

export type Greeting = "first-run" | "returning" | null

export type SortType = "energy-asc" | "energy-desc" | "time-asc"

export type UntangleStatus =
  | { state: "idle" }
  | { state: "untangling" }
  | { state: "error"; kind: ApiErrorKind | "unknown"; message: string }
