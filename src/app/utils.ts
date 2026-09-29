import { MicroTask } from "../types"

export function countActive(tasks: MicroTask[]): number {
  return tasks.filter((t) => !t.completed).length
}

export function countActiveInCategory(tasks: MicroTask[], keyword: string): number {
  return tasks.filter((t) => t.category.toLowerCase().includes(keyword) && !t.completed).length
}
