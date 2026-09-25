export type EnergyLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface MicroTask {
  id: string;
  userId?: string;
  title: string;
  firstPhysicalStep: string;
  estimatedMinutes: number;
  energyLevel: EnergyLevel;
  category: string;
  priority?: PriorityLevel;
  whyItMatters: string;
  substeps: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export interface BrainDumpTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  iconName: string;
}

export interface ParkingLotItem {
  id: string;
  userId?: string;
  text: string;
  createdAt: string;
  convertedToTaskId?: string;
}

export type AmbientSoundType = 'none' | 'brown' | 'rain' | 'white';

export interface UnstickResult {
  chosenTaskId: string;
  reasoning: string;
  sparkChallenge: string;
}
