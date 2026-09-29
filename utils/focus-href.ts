export function focusHref(taskId: string, minutes?: number) {
  return {
    pathname: "/focus" as const,
    params: minutes ? { id: taskId, minutes: String(minutes) } : { id: taskId },
  }
}
