import { Category } from './types';

interface CategoryConfig {
  icon: string;
  color: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  taxes: { icon: '\ud83c\udfdb\ufe0f', color: '#AF52DE' },
  insurance: { icon: '\ud83d\udee1\ufe0f', color: '#5AC8FA' },
  bank: { icon: '\ud83c\udfe6', color: '#34C759' },
  fines: { icon: '\u26a0\ufe0f', color: '#FF3B30' },
  housing: { icon: '\ud83c\udfe0', color: '#FF9500' },
  health: { icon: '\u2764\ufe0f', color: '#FF2D55' },
  employment: { icon: '\ud83d\udcbc', color: '#5856D6' },
  legal: { icon: '\u2696\ufe0f', color: '#2A2A3E' },
  other: { icon: '\ud83d\udcc4', color: '#8E8E93' },
};

export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.other;
}
