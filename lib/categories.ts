import { Category } from './types';

interface CategoryConfig {
  icon: string;
  label: string;
  color: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  taxes: { icon: '', label: 'taxes', color: '#AF52DE' },
  insurance: { icon: '', label: 'insurance', color: '#5AC8FA' },
  bank: { icon: '', label: 'bank', color: '#34C759' },
  fines: { icon: '', label: 'fines', color: '#FF3B30' },
  housing: { icon: '', label: 'housing', color: '#FF9500' },
  health: { icon: '', label: 'health', color: '#FF2D55' },
  employment: { icon: '', label: 'employment', color: '#5856D6' },
  legal: { icon: '', label: 'legal', color: '#1A1A2E' },
  other: { icon: '', label: 'other', color: '#8E8E93' },
};

export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.other;
}
