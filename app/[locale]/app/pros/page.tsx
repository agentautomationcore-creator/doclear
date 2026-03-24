'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Professional, Locale } from '@/lib/types';
import professionalsData from '@/data/professionals.json';

const professionals = professionalsData as Professional[];

type FilterCategory = 'all' | 'lawyers' | 'accountants' | 'translators' | 'notaries' | 'insurance' | 'doctors' | 'realtors';

const FILTER_TO_TYPES: Record<FilterCategory, string[]> = {
  all: [],
  lawyers: ['immigration_lawyer', 'tax_lawyer', 'labor_lawyer', 'family_lawyer', 'real_estate_lawyer'],
  accountants: ['accountant'],
  translators: ['sworn_translator'],
  notaries: ['notary'],
  insurance: ['insurance_broker'],
  doctors: ['doctor'],
  realtors: ['realtor'],
};

const filterCategories: FilterCategory[] = ['all', 'lawyers', 'accountants', 'translators', 'notaries', 'insurance', 'doctors', 'realtors'];
const languages: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

const LANGUAGE_LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  ru: 'RU',
  ar: 'AR',
  it: 'IT',
  zh: 'ZH',
  pt: 'PT',
  tr: 'TR',
};

const TYPE_COLORS: Record<string, string> = {
  immigration_lawyer: '#3B82F6',
  tax_lawyer: '#8B5CF6',
  labor_lawyer: '#EC4899',
  family_lawyer: '#F59E0B',
  real_estate_lawyer: '#10B981',
  accountant: '#6366F1',
  sworn_translator: '#14B8A6',
  notary: '#F97316',
  insurance_broker: '#0EA5E9',
  doctor: '#EF4444',
  realtor: '#84CC16',
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function ProsPage() {
  const t = useTranslations('pros');
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  const [filter, setFilter] = useState<FilterCategory>(() => {
    if (typeParam) {
      for (const [cat, types] of Object.entries(FILTER_TO_TYPES)) {
        if (types.includes(typeParam)) return cat as FilterCategory;
      }
    }
    return 'all';
  });
  const [langFilter, setLangFilter] = useState<Locale | 'all'>('all');

  const filtered = useMemo(() => {
    let result = professionals;

    if (filter !== 'all') {
      const types = FILTER_TO_TYPES[filter];
      result = result.filter((p) => types.includes(p.type));
    }

    if (typeParam && filter === 'all') {
      result = result.filter((p) => p.type === typeParam);
    }

    if (langFilter !== 'all') {
      result = result.filter((p) => p.languages.includes(langFilter));
    }

    return result.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return b.rating - a.rating;
    });
  }, [filter, langFilter, typeParam]);

  return (
    <div className="min-h-screen bg-white safe-area-inset-top max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 pt-4 pb-3">
        <h1 className="text-[22px] font-bold text-[#1A1A2E] mb-0.5">{t('title')}</h1>
        <p className="text-sm text-[#6B7280] mb-3">{t('subtitle')}</p>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 pb-2">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all min-h-[36px] ${
                cat === filter
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F5F5F7] text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {t(`filter_${cat}` as any)}
            </button>
          ))}
        </div>

        {/* Language filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setLangFilter('all')}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
              langFilter === 'all'
                ? 'bg-[#1A1A2E] text-white'
                : 'bg-[#F5F5F7] text-[#6B7280]'
            }`}
          >
            ALL
          </button>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                langFilter === l
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F5F5F7] text-[#6B7280]'
              }`}
            >
              {LANGUAGE_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Professional cards */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <svg className="w-12 h-12 mx-auto mb-3 text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[15px]">{t('filter_all')}</p>
          </div>
        ) : (
          filtered.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-black/[0.06] p-5"
            >
              <div className="flex items-start gap-3.5">
                {/* Type indicator dot */}
                <div className="flex-shrink-0 mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[pro.type] || '#6B7280' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A2E] truncate">{pro.name}</h3>

                  {/* Description */}
                  <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                    {pro.description[locale] || pro.description.en || pro.description.fr}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-2.5 text-sm">
                    <span className="text-[#6B7280]">{pro.city}</span>
                    <span className="text-[#D1D5DB]">/</span>
                    <span className="flex items-center gap-0.5 text-yellow-500">
                      <StarIcon />
                      <span className="text-[13px] font-medium">{pro.rating}</span>
                    </span>
                    {pro.availableOnline && (
                      <>
                        <span className="text-[#D1D5DB]">/</span>
                        <span className="text-[#34C759] text-xs font-medium">{t('online')}</span>
                      </>
                    )}
                  </div>

                  {/* Languages as text pills */}
                  <div className="flex gap-1.5 mt-2.5">
                    {pro.languages.map((l) => (
                      <span
                        key={l}
                        className="bg-[#F5F5F7] text-[#6B7280] rounded-full px-2 py-0.5 text-xs font-medium"
                      >
                        {LANGUAGE_LABELS[l as Locale] || l.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {pro.priceRange && (
                    <p className="text-xs text-[#6B7280] mt-2">{pro.priceRange}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3.5">
                    {pro.phone && (
                      <a
                        href={`tel:${pro.phone}`}
                        className="flex items-center gap-1.5 bg-[#34C759] text-white text-sm font-medium px-4 py-2 rounded-[12px] active:scale-95 transition-transform"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {t('call')}
                      </a>
                    )}
                    {pro.email && (
                      <a
                        href={`mailto:${pro.email}`}
                        className="flex items-center gap-1.5 bg-[#F5F5F7] text-[#1A1A2E] text-sm font-medium px-4 py-2 rounded-[12px] border border-black/[0.06]"
                      >
                        {t('email')}
                      </a>
                    )}
                    {pro.website && (
                      <a
                        href={pro.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#F5F5F7] text-[#1A1A2E] text-sm font-medium px-4 py-2 rounded-[12px] border border-black/[0.06]"
                      >
                        {t('website')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
