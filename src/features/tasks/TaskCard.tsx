import React, { useState } from 'react';
import {
  Check,
  Play,
  Scissors,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Tag,
  AlertCircle,
  Briefcase,
  Home,
  Heart,
  Landmark,
  ShoppingBag,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroTask, EnergyLevel, PriorityLevel } from '../../types';
import { soundService } from '../../services/sound';
import { apiBreakdownTask } from '../../services/api';
import { DEFAULT_CATEGORIES, getCategoryStyle } from '../../data/categories';

interface TaskCardProps {
  task: MicroTask;
  onToggleComplete: (id: string) => void;
  onToggleSubstep: (taskId: string, substepId: string) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: MicroTask) => void;
  onUpdateTask: (task: MicroTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubstep,
  onDelete,
  onStartFocus,
  onUpdateTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const handleComplete = () => {
    if (!task.completed) {
      soundService.playCompletionChime();
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.75 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        disableForReducedMotion: true,
      });
    }
    onToggleComplete(task.id);
  };

  const handleSubstepCheck = (subId: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      soundService.playTick();
    }
    onToggleSubstep(task.id, subId);
  };

  const handleBreakdownFurther = async () => {
    setIsBreakingDown(true);
    try {
      const result = await apiBreakdownTask(task.title, task.firstPhysicalStep);
      const newSubsteps = result.microSteps.map((stepText, idx) => ({
        id: `micro_${Date.now()}_${idx}`,
        text: stepText,
        completed: false,
      }));

      onUpdateTask({
        ...task,
        firstPhysicalStep: result.easierFirstStep || task.firstPhysicalStep,
        substeps: [...task.substeps, ...newSubsteps],
      });
      setIsExpanded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    onUpdateTask({
      ...task,
      category: categoryName,
    });
    setIsCategoryMenuOpen(false);
  };

  const handleTogglePriority = () => {
    const cycle: Record<PriorityLevel, PriorityLevel> = {
      high: 'medium',
      medium: 'low',
      low: 'high',
    };
    const current = task.priority || 'medium';
    onUpdateTask({
      ...task,
      priority: cycle[current],
    });
  };

  const completedSubstepsCount = task.substeps.filter((s) => s.completed).length;
  const totalSubsteps = task.substeps.length;

  const energyColors: Record<EnergyLevel, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-rose-400',
  };

  const categoryStyle = getCategoryStyle(task.category);

  const priorityStyles: Record<PriorityLevel, { text: string; label: string }> = {
    high: { text: 'text-rose-400', label: 'High Priority' },
    medium: { text: 'text-amber-400', label: 'Med Priority' },
    low: { text: 'text-neutral-500', label: 'Low Priority' },
  };

  const currentPriority = task.priority || 'medium';

  return (
    <div
      className={`group border rounded-xl transition-all duration-200 ${
        task.completed
          ? 'bg-neutral-900/30 border-neutral-900/80 opacity-60'
          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700/80 shadow-sm'
      }`}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3.5">
          {/* Main task complete toggle */}
          <button
            type="button"
            onClick={handleComplete}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              task.completed
                ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                : 'border-neutral-700 hover:border-amber-400 bg-neutral-950 text-transparent'
            }`}
            title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            {/* Title & Category/Priority row */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 mb-1.5">
              <h3
                className={`text-sm md:text-base font-semibold leading-snug break-words ${
                  task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                }`}
              >
                {task.title}
              </h3>

              {/* Zero-Pill Text Metadata & Category Pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 shrink-0 font-mono tabular-nums">
                {/* Category Badge with Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                    disabled={task.completed}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-sans font-medium flex items-center gap-1 transition-colors ${categoryStyle.bgLight} ${categoryStyle.borderColor} ${categoryStyle.textColor} hover:brightness-110`}
                    title="Click to change category"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>{task.category}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {/* Category Switcher Menu */}
                  {isCategoryMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 text-xs font-sans">
                      <div className="px-2 py-1 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Switch Category
                      </div>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.name)}
                          className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                            task.category === cat.name
                              ? 'bg-neutral-800 text-white font-medium'
                              : 'text-neutral-300 hover:bg-neutral-800/60'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span aria-hidden="true" className="text-neutral-700">·</span>

                {/* Priority Toggle */}
                {!task.completed && (
                  <button
                    type="button"
                    onClick={handleTogglePriority}
                    className={`text-[11px] font-sans font-medium hover:underline ${priorityStyles[currentPriority].text}`}
                    title="Click to toggle priority (high / medium / low)"
                  >
                    {priorityStyles[currentPriority].label}
                  </button>
                )}

                <span aria-hidden="true" className="text-neutral-700">·</span>

                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span>{task.estimatedMinutes}m</span>
                </span>

                <span aria-hidden="true" className="text-neutral-700">·</span>
                <span className={`capitalize ${energyColors[task.energyLevel]}`}>
                  {task.energyLevel} energy
                </span>
              </div>
            </div>

            {/* First Physical Step: The ADHD Spark Banner */}
            {!task.completed && (
              <div className="mt-2.5 mb-2 p-2.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-2.5 h-2.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider block">
                    Immediate Physical First Step
                  </span>
                  <p className="text-xs text-neutral-300 mt-0.5 font-normal leading-relaxed">
                    {task.firstPhysicalStep}
                  </p>
                </div>
              </div>
            )}

            {/* Why It Matters Rationale */}
            {task.whyItMatters && !task.completed && (
              <p className="text-xs text-neutral-500 mt-1 italic">
                {task.whyItMatters}
              </p>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-800/60">
              <div className="flex items-center gap-2">
                {!task.completed && (
                  <button
                    type="button"
                    onClick={() => onStartFocus(task)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-amber-300" />
                    <span>Focus on this</span>
                  </button>
                )}

                {!task.completed && (
                  <button
                    type="button"
                    onClick={handleBreakdownFurther}
                    disabled={isBreakingDown}
                    className="px-2.5 py-1 text-xs font-medium rounded-md text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition-colors flex items-center gap-1.5"
                    title="Feeling paralyzed? Split into smaller micro-steps"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>{isBreakingDown ? 'Slicing...' : 'Break down further'}</span>
                  </button>
                )}

                {totalSubsteps > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
                  >
                    <span>
                      {completedSubstepsCount}/{totalSubsteps} micro-steps
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Substep Checklist */}
            {isExpanded && totalSubsteps > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                  Micro-Steps (Check off as you move)
                </div>
                {task.substeps.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleSubstepCheck(sub.id, sub.completed)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      sub.completed
                        ? 'bg-neutral-950/40 text-neutral-500 line-through'
                        : 'bg-neutral-950/80 text-neutral-300 hover:bg-neutral-950'
                    }`}
                  >
                    <button
                      type="button"
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        sub.completed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-neutral-700 bg-neutral-900 text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                    <span className="text-xs select-none">{sub.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
