'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Professional, PROFESSIONAL_ICONS, LOCALE_FLAGS, Locale } from '@/lib/types';
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
    <div className="min-h-screen bg-white safe-area-inset-top">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t('title')}</h1>
        <p className="text-sm text-muted mb-3">{t('subtitle')}</p>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                cat === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t(`filter_${cat}` as any)}
            </button>
          ))}
        </div>

        {/* Language filter */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setLangFilter('all')}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
              langFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t('filter_all')}
          </button>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs ${
                langFilter === l ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {LOCALE_FLAGS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="text-5xl mb-3">{'\u2696\ufe0f'}</div>
            <p>{t('filter_all')}</p>
          </div>
        ) : (
          filtered.map((pro) => (
            <div key={pro.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {PROFESSIONAL_ICONS[pro.type] || '\ud83d\udc64'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{pro.name}</h3>
                    {pro.recommended && (
                      <span className="flex-shrink-0 text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                        {t('recommended')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted mt-0.5">
                    {pro.description[locale] || pro.description.en || pro.description.fr}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="text-gray-500">{pro.city}</span>
                    <span className="text-gray-300">{'\u00b7'}</span>
                    <span className="text-yellow-500">{'\u2b50'} {pro.rating}</span>
                    {pro.availableOnline && (
                      <>
                        <span className="text-gray-300">{'\u00b7'}</span>
                        <span className="text-success text-xs">{t('online')}</span>
                      </>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="flex gap-1 mt-2">
                    {pro.languages.map((l) => (
                      <span key={l} className="text-sm">
                        {LOCALE_FLAGS[l as Locale] || l}
                      </span>
                    ))}
                  </div>

                  {pro.priceRange && (
                    <p className="text-xs text-muted mt-1">{pro.priceRange}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {pro.phone && (
                      <a
                        href={`tel:${pro.phone}`}
                        className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                      >
                        {t('call')}
                      </a>
                    )}
                    {pro.email && (
                      <a
                        href={`mailto:${pro.email}`}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                      >
                        {t('email')}
                      </a>
                    )}
                    {pro.website && (
                      <a
                        href={pro.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg"
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
