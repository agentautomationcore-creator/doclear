'use client';

import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';

interface Props {
  selected: Category | 'all';
  onChange: (cat: Category | 'all') => void;
}

const allCategories: (Category | 'all')[] = [
  'all',
  'taxes',
  'insurance',
  'bank',
  'fines',
  'housing',
  'health',
  'employment',
  'legal',
  'other',
];

export default function CategoryFilter({ selected, onChange }: Props) {
  const t = useTranslations('timeline');
  const categories = useTranslations('categories');

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {allCategories.map((cat) => {
        const isActive = cat === selected;
        const icon = cat === 'all' ? null : CATEGORIES[cat as Category].icon;
        const label = cat === 'all' ? t('filter_all') : categories(cat as any);

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:bg-border'
            }`}
          >
            {icon && <span>{icon}</span>}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
