import React from 'react';
import { Flame, CheckCircle, Clock, BatteryCharging, Layers, Tag } from 'lucide-react';
import { MicroTask } from '../../types';
import { DEFAULT_CATEGORIES, getCategoryStyle } from '../../data/categories';

interface DopamineTrackerProps {
  tasks: MicroTask[];
}

export const DopamineTracker: React.FC<DopamineTrackerProps> = ({ tasks }) => {
  const completedTasks = tasks.filter((t) => t.completed);
  const totalMinutesSaved = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 5), 0);
  const quickWinsCompleted = completedTasks.filter((t) => t.estimatedMinutes <= 5).length;

  // Group by category
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};

    tasks.forEach((t) => {
      const cat = t.category || 'Personal';
      if (!stats[cat]) {
        stats[cat] = { total: 0, completed: 0 };
      }
      stats[cat].total += 1;
      if (t.completed) {
        stats[cat].completed += 1;
      }
    });

    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  }, [tasks]);

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 md:p-6 backdrop-blur-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-neutral-200 flex items-center gap-2">
            <span>Dopamine & Priority Area Momentum</span>
            <span className="text-[11px] text-neutral-500 font-normal">
              No guilt tracking
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every micro-action counts. Even 3 minutes unblocks executive inertia.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>Active Momentum</span>
        </div>
      </div>

      {/* 3 Core Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl">
          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Checked Off</span>
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-neutral-100 mt-1">
            {completedTasks.length}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">micro-actions</div>
        </div>

        <div className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl">
          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Minutes In Flow</span>
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-amber-300 mt-1">
            {totalMinutesSaved}m
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">focused execution</div>
        </div>

        <div className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg">
          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-sky-400" />
            <span>Quick Wins</span>
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-sky-300 mt-1">
            {quickWinsCompleted}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">≤5 min starters</div>
        </div>
      </div>

      {/* Category / Priority Area Progress Breakdown */}
      {categoryStats.length > 0 && (
        <div className="pt-3 border-t border-neutral-800 space-y-3">
          <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Layers className="w-3 h-3 text-neutral-400" />
            <span>Breakdown by Priority Area</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryStats.map(([category, { total, completed }]) => {
              const style = getCategoryStyle(category);
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={category}
                  className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: style.color }}
                      />
                      <span>{category}</span>
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {completed}/{total} ({percentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: style.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
