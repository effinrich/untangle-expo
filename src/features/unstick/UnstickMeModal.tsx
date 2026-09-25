import React, { useState } from 'react';
import { X, Sparkles, Wand2, ArrowRight, Zap, BatteryCharging, Check } from 'lucide-react';
import { MicroTask, UnstickResult } from '../../types';
import { apiUnstickMe } from '../../services/api';

interface UnstickMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: MicroTask[];
  onStartFocus: (task: MicroTask) => void;
}

export const UnstickMeModal: React.FC<UnstickMeModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onStartFocus,
}) => {
  const [mood, setMood] = useState('Paralyzed / cannot pick where to start');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnstickResult | null>(null);

  if (!isOpen) return null;

  const incompleteTasks = tasks.filter((t) => !t.completed);

  const moodOptions = [
    'Paralyzed / cannot pick where to start',
    'Brain is completely fried (0% energy)',
    'Restless, distracted, opening 15 tabs',
    'Dreading a high-stakes thing',
  ];

  const handleDiagnose = async () => {
    if (incompleteTasks.length === 0) return;
    setLoading(true);
    try {
      const res = await apiUnstickMe(incompleteTasks, mood);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chosenTask = incompleteTasks.find((t) => t.id === result?.chosenTaskId) || incompleteTasks[0];

  const handleAcceptSpark = () => {
    if (chosenTask) {
      onStartFocus({
        ...chosenTask,
        estimatedMinutes: 2, // 2-minute micro challenge
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>ADHD Unstick Assistant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {incompleteTasks.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-100">All tasks completed!</h3>
            <p className="text-xs text-neutral-400 mt-1">
              You are completely clear. Add a new brain dump or take a well-deserved rest.
            </p>
          </div>
        ) : !result ? (
          <div>
            <h3 className="text-base font-semibold text-neutral-100 tracking-tight">
              Executive Dysfunction Reset
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              When ADHD paralysis hits, making decisions burns all your remaining dopamine. Let AI remove the decision burden and pick the single lowest-barrier action for you.
            </p>

            <div className="my-4 space-y-2">
              <label className="text-xs font-medium text-neutral-300 block">
                How does your brain feel right now?
              </label>
              {moodOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMood(opt)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    mood === opt
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <span>{opt}</span>
                  {mood === opt && <Zap className="w-3.5 h-3.5 fill-amber-300" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDiagnose}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-semibold text-xs hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 mt-2 shadow-md shadow-amber-500/10"
            >
              {loading ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>Picking the Single Easiest Spark...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pick For Me (Remove Decision Fatigue)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Decision Made For You:
              </span>
              <h4 className="text-base font-bold text-neutral-100 mt-1">
                {chosenTask.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {result.reasoning}
              </p>
            </div>

            <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                The 2-Minute Spark Contract:
              </span>
              <p className="text-xs text-neutral-200 mt-1 font-medium leading-relaxed">
                "{result.sparkChallenge}"
              </p>
              <div className="text-[11px] text-amber-400/80 mt-2 italic">
                *Neuro-rule: If you still want to quit after 120 seconds, you are 100% free to stop. No guilt.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs"
              >
                Pick Another
              </button>
              <button
                type="button"
                onClick={handleAcceptSpark}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <span>Accept 2-Minute Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
