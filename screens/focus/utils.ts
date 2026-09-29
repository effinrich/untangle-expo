export function parseFocusSeconds(minutes: string | undefined): number {
  return (parseInt(minutes || "10", 10) || 10) * 60
}

export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export function spokenTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const parts = [
    mins > 0 ? `${mins} ${mins === 1 ? "minute" : "minutes"}` : "",
    secs > 0 ? `${secs} ${secs === 1 ? "second" : "seconds"}` : "",
  ].filter(Boolean)
  return parts.length ? `${parts.join(" ")} left` : "Time's up"
}
