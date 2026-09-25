import { MicroTask, UnstickResult } from '../types';

export interface UntangleResponse {
  summary: string;
  tasks: MicroTask[];
}

export async function apiUntangleBrainDump(
  rawDump: string,
  userEnergyPreference: string = 'all'
): Promise<UntangleResponse> {
  const res = await fetch('/api/untangle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawDump, userEnergyPreference }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to untangle brain dump');
  }

  const data = await res.json();
  // Format tasks with substep structure
  const formattedTasks: MicroTask[] = (data.tasks || []).map((t: any, index: number) => ({
    id: t.id || `task_${Date.now()}_${index}`,
    title: t.title || 'Untitled Action',
    firstPhysicalStep: t.firstPhysicalStep || 'Open relevant tool or app',
    estimatedMinutes: Number(t.estimatedMinutes) || 10,
    energyLevel: t.energyLevel || 'medium',
    category: t.category || 'Personal',
    priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
    whyItMatters: t.whyItMatters || 'Frees up mental RAM and eases overwhelm',
    substeps: Array.isArray(t.substeps)
      ? t.substeps.map((sub: string, sIdx: number) => ({
          id: `sub_${Date.now()}_${index}_${sIdx}`,
          text: typeof sub === 'string' ? sub : (sub as any).text,
          completed: false,
        }))
      : [
          { id: `sub_${Date.now()}_${index}_0`, text: 'Start with 2-minute timer', completed: false },
          { id: `sub_${Date.now()}_${index}_1`, text: 'Complete first micro piece', completed: false },
        ],
    completed: false,
    createdAt: new Date().toISOString(),
  }));

  return {
    summary: data.summary || "I've organized your thoughts into bite-sized momentum.",
    tasks: formattedTasks,
  };
}

export async function apiBreakdownTask(
  taskTitle: string,
  currentFirstStep?: string
): Promise<{ easierFirstStep: string; microSteps: string[] }> {
  const res = await fetch('/api/breakdown-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskTitle, currentFirstStep }),
  });

  if (!res.ok) {
    throw new Error('Failed to break down task');
  }

  return res.json();
}

export async function apiUnstickMe(
  tasks: MicroTask[],
  currentMood: string
): Promise<UnstickResult> {
  const res = await fetch('/api/unstick-me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, currentMood }),
  });

  if (!res.ok) {
    throw new Error('Failed to get unstick advice');
  }

  return res.json();
}
