import { Category } from './types';

interface CategoryConfig {
  icon: string;
  color: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  taxes: { icon: '\ud83c\udfdb\ufe0f', color: '#4A90D9' },
  insurance: { icon: '\ud83d\udee1\ufe0f', color: '#7B68EE' },
  bank: { icon: '\ud83c\udfe6', color: '#2ECC71' },
  fines: { icon: '\u26a0\ufe0f', color: '#E74C3C' },
  housing: { icon: '\ud83c\udfe0', color: '#F39C12' },
  health: { icon: '\u2764\ufe0f', color: '#E91E63' },
  employment: { icon: '\ud83d\udcbc', color: '#9B59B6' },
  legal: { icon: '\u2696\ufe0f', color: '#34495E' },
  other: { icon: '\ud83d\udcc4', color: '#95A5A6' },
};

export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.other;
}
