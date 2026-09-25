import { CategoryConfig } from '../types';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'work',
    name: 'Work',
    color: '#3B82F6', // Blue
    bgLight: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    icon: 'Briefcase',
    description: 'Professional projects, deadlines, emails, and meetings',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    icon: 'Home',
    description: 'Home, hobbies, social relationships, and self-care',
  },
  {
    id: 'health',
    name: 'Health',
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    icon: 'Heart',
    description: 'Exercise, medication, nutrition, sleep, and medical visits',
  },
  {
    id: 'admin',
    name: 'Finance / Admin',
    color: '#8B5CF6', // Purple
    bgLight: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: 'Landmark',
    description: 'Bills, paperwork, taxes, banking, subscriptions',
  },
  {
    id: 'errands',
    name: 'Errands',
    color: '#06B6D4', // Cyan
    bgLight: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    icon: 'ShoppingBag',
    description: 'Groceries, pickups, post office, car maintenance',
  },
  {
    id: 'creative',
    name: 'Creative',
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-500/10',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    icon: 'Palette',
    description: 'Writing, building, designing, coding, and brainstorming',
  },
];

export function getCategoryStyle(categoryName: string): CategoryConfig {
  const normalized = categoryName.trim().toLowerCase();
  const found = DEFAULT_CATEGORIES.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.id.toLowerCase() === normalized ||
      (normalized.includes('work') && c.id === 'work') ||
      (normalized.includes('health') && c.id === 'health') ||
      (normalized.includes('personal') && c.id === 'personal') ||
      (normalized.includes('admin') && c.id === 'admin') ||
      (normalized.includes('finance') && c.id === 'admin') ||
      (normalized.includes('errand') && c.id === 'errands') ||
      (normalized.includes('creat') && c.id === 'creative')
  );

  if (found) return found;

  // Fallback styling for custom categories
  return {
    id: normalized.replace(/\s+/g, '-'),
    name: categoryName,
    color: '#E5E5E5',
    bgLight: 'bg-neutral-800/80',
    textColor: 'text-neutral-300',
    borderColor: 'border-neutral-700/60',
    icon: 'Tag',
    description: 'Custom category',
  };
}
