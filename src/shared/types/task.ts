import { MicroTask } from "../../types"

export type NewTaskInput = Omit<MicroTask, "id" | "createdAt" | "completed">
