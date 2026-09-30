import React from "react"
import { MicroTask } from "../../../types"
import { getCategoryStyle } from "../../../data/categories"

interface DopamineTrackerProps {
  tasks: MicroTask[]
}

// Data, not tiles. This was a grid of three equal stat cards plus a card per
// category, which gave every row the same weight and told the eye nothing.
export const DopamineTracker: React.FC<DopamineTrackerProps> = ({ tasks }) => {
  const completedTasks = tasks.filter((t) => t.completed)
  const totalMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 5), 0)
  const quickWins = completedTasks.filter((t) => t.estimatedMinutes <= 5).length

  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {}

    tasks.forEach((t) => {
      const cat = t.category || "Personal"
      if (!stats[cat]) {
        stats[cat] = { total: 0, completed: 0 }
      }
      stats[cat].total += 1
      if (t.completed) {
        stats[cat].completed += 1
      }
    })

    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total)
  }, [tasks])

  const dot = (
    <span aria-hidden="true" className="text-neutral-700">
      {" · "}
    </span>
  )

  return (
    <section className="space-y-4 pt-6 border-t border-neutral-800">
      <h2 className="text-xl text-neutral-100">Momentum</h2>

      <p className="text-sm text-neutral-500">
        <span className="text-neutral-100 tabular-nums">{completedTasks.length}</span> done
        {dot}
        <span className="tabular-nums">{totalMinutes}m</span> in flow
        {dot}
        <span className="tabular-nums">{quickWins}</span> quick wins
      </p>

      {categoryStats.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-neutral-500">By area</h3>
          <ul className="space-y-2">
            {categoryStats.map(([category, { total, completed }]) => {
              const style = getCategoryStyle(category)
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <li key={category} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: style.color }}
                  />
                  <span className="w-32 truncate text-neutral-300">{category}</span>
                  <span aria-hidden="true" className="flex-1 h-px bg-neutral-800" />
                  <span className="tabular-nums text-neutral-500 shrink-0">
                    {completed}/{total} ({percentage}%)
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
