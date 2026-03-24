'use client';

import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';

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
        const label = cat === 'all' ? t('filter_all') : categories(cat as any);

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors min-h-[36px] ${
              isActive
                ? 'bg-[#1A1A2E] text-white'
                : 'bg-[#F5F5F7] text-[#6B7280] border border-black/[0.06] hover:bg-[#E5E7EB]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
