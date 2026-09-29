import { ApiErrorKind } from "../../services/api-client"

export type SortType = "energy-asc" | "energy-desc" | "time-asc"

export type UntangleStatus =
  | { state: "idle" }
  | { state: "untangling" }
  | { state: "error"; kind: ApiErrorKind | "unknown"; message: string }
