import { Category } from './types';

interface CategoryConfig {
  icon: string;
  color: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  taxes: { icon: '\ud83c\udfdb\ufe0f', color: '#FFD700' },
  insurance: { icon: '\ud83d\udee1\ufe0f', color: '#45AAF2' },
  bank: { icon: '\ud83c\udfe6', color: '#2ED573' },
  fines: { icon: '\u26a0\ufe0f', color: '#FF4757' },
  housing: { icon: '\ud83c\udfe0', color: '#FFA502' },
  health: { icon: '\u2764\ufe0f', color: '#FF6B81' },
  employment: { icon: '\ud83d\udcbc', color: '#A55EEA' },
  legal: { icon: '\u2696\ufe0f', color: '#FFFFFF' },
  other: { icon: '\ud83d\udcc4', color: '#95A5A6' },
};

export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES[category] || CATEGORIES.other;
}
