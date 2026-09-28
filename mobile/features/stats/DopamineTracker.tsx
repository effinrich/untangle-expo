import { View, Text } from 'react-native';
import React from "react"
import { Flame, CheckCircle, Clock, BatteryCharging, Layers, Tag } from "lucide-react-native"
import { MicroTask } from "../../types"
import { DEFAULT_CATEGORIES, getCategoryStyle } from "../../data/categories"

interface DopamineTrackerProps {
  tasks: MicroTask[]
}

export const DopamineTracker: React.FC<DopamineTrackerProps> = ({ tasks }) => {
  const completedTasks = tasks.filter((t) => t.completed)
  const totalMinutesSaved = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 5), 0)
  const quickWinsCompleted = completedTasks.filter((t) => t.estimatedMinutes <= 5).length

  // Group by category
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

  return (
    <View className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 md:p-6 backdrop-blur-sm space-y-5">
      <View className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <View>
          <Text className="text-sm md:text-base font-semibold text-neutral-200 flex items-center gap-2">
            <Text>Dopamine & Priority Area Momentum</Text>
            <Text className="text-[11px] text-neutral-500 font-normal">No guilt tracking</Text>
          </Text>
          <Text className="text-xs text-neutral-500 mt-0.5">
            Every micro-action counts. Even 3 minutes unblocks executive inertia.
          </Text>
        </View>

        <View className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <Text>Active Momentum</Text>
        </View>
      </View>

      {/* 3 Core Stats Cards */}
      <View className="grid grid-cols-3 gap-2.5">
        <View className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl">
          <View className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <Text>Checked Off</Text>
          </View>
          <View className="text-xl md:text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {completedTasks.length}
          </View>
          <View className="text-[10px] text-neutral-500 mt-0.5">micro-actions</View>
        </View>

        <View className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl">
          <View className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <Text>Minutes In Flow</Text>
          </View>
          <View className="text-xl md:text-2xl font-bold font-mono tabular-nums text-amber-300 mt-1">
            {totalMinutesSaved}m
          </View>
          <View className="text-[10px] text-neutral-500 mt-0.5">focused execution</View>
        </View>

        <View className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg">
          <View className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-sky-400" />
            <Text>Quick Wins</Text>
          </View>
          <View className="text-xl md:text-2xl font-bold font-mono tabular-nums text-sky-300 mt-1">
            {quickWinsCompleted}
          </View>
          <View className="text-[10px] text-neutral-500 mt-0.5">≤5 min starters</View>
        </View>
      </View>

      {/* Category / Priority Area Progress Breakdown */}
      {categoryStats.length > 0 && (
        <View className="pt-3 border-t border-neutral-800 space-y-3">
          <View className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Layers className="w-3 h-3 text-neutral-400" />
            <Text>Breakdown by Priority Area</Text>
          </View>

          <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryStats.map(([category, { total, completed }]) => {
              const style = getCategoryStyle(category)
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <View
                  key={category}
                  className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-2"
                >
                  <View className="flex items-center justify-between">
                    <Text className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                      <Text
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: style.color }}
                      />
                      <Text>{category}</Text>
                    </Text>
                    <Text className="text-[11px] font-mono text-neutral-400">
                      {completed}/{total} ({percentage}%)
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <View
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: style.color,
                      }}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}
    </View>
  )
}
