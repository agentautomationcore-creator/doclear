'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Locale } from '@/lib/types';
import prosData from '@/data/professionals.json';

interface Specialist {
  name: string;
  firm: string;
  specialization: string;
  city: string;
  address: string | null;
  phone: string | null;
  email?: string | null;
  website: string | null;
  languages: string[];
  hours: string | null;
}

interface CategoryGroup {
  category: string;
  specialists: Specialist[];
}

const data = prosData as CategoryGroup[];

type FilterKey = 'all' | 'lawyers' | 'accountants' | 'translators' | 'notaries' | 'insurance' | 'doctors' | 'realtors';

const FILTER_TO_CATEGORY: Record<FilterKey, string> = {
  all: '',
  lawyers: 'Avocats',
  accountants: 'Comptables',
  translators: 'Traducteurs',
  notaries: 'Notaires',
  insurance: 'Assurances',
  doctors: 'Médecins',
  realtors: 'Agents immobiliers',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Avocats': '#3B82F6',
  'Notaires': '#F97316',
  'Comptables': '#6366F1',
  'Traducteurs': '#14B8A6',
  'Assurances': '#0EA5E9',
  'Médecins': '#EF4444',
  'Agents immobiliers': '#84CC16',
};

const filterKeys: FilterKey[] = ['all', 'lawyers', 'accountants', 'translators', 'notaries', 'insurance', 'doctors', 'realtors'];
const languages: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

const LANG_LABELS: Record<string, string> = {
  fr: 'FR', en: 'EN', ru: 'RU', ar: 'AR', it: 'IT', zh: 'ZH', pt: 'PT', tr: 'TR',
  de: 'DE', es: 'ES', uk: 'UK', pl: 'PL',
};

export default function ProsPage() {
  const t = useTranslations('pros');
  const locale = useLocale() as Locale;
  const [filter, setFilter] = useState<FilterKey>('all');
  const [langFilter, setLangFilter] = useState<string>('all');

  const allSpecialists = useMemo(() => {
    const result: (Specialist & { categoryName: string })[] = [];
    for (const group of data) {
      for (const spec of group.specialists) {
        result.push({ ...spec, categoryName: group.category });
      }
    }
    return result;
  }, []);

  const filtered = useMemo(() => {
    let result = allSpecialists;

    if (filter !== 'all') {
      const catName = FILTER_TO_CATEGORY[filter];
      result = result.filter((s) => s.categoryName === catName);
    }

    if (langFilter !== 'all') {
      result = result.filter((s) => s.languages.includes(langFilter));
    }

    // Sort: specialists speaking user's language first
    return result.sort((a, b) => {
      const aMatch = a.languages.includes(locale) ? 1 : 0;
      const bMatch = b.languages.includes(locale) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [filter, langFilter, allSpecialists, locale]);

  return (
    <div className="min-h-screen bg-white safe-area-inset-top max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 pt-4 pb-3">
        <h1 className="text-[22px] font-bold text-[#1A1A2E] mb-0.5">{t('title')}</h1>
        <p className="text-sm text-[#6B7280] mb-3">{t('subtitle')}</p>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 pb-2">
          {filterKeys.map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all min-h-[36px] ${
                key === filter
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-[#F5F5F7] text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {t(`filter_${key}` as any)}
            </button>
          ))}
        </div>

        {/* Language filter */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setLangFilter('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
              langFilter === 'all' ? 'bg-[#1A1A2E] text-white' : 'bg-[#F5F5F7] text-[#6B7280]'
            }`}
          >
            ALL
          </button>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                langFilter === l ? 'bg-[#1A1A2E] text-white' : 'bg-[#F5F5F7] text-[#6B7280]'
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Specialist cards */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <svg className="w-12 h-12 mx-auto mb-3 text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[15px]">{t('filter_all')}</p>
          </div>
        ) : (
          filtered.map((spec, i) => (
            <div
              key={`${spec.name}-${i}`}
              className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-black/[0.06] p-5"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[spec.categoryName] || '#6B7280' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A2E]">{spec.name}</h3>
                  {spec.firm !== spec.name && (
                    <p className="text-xs text-[#6B7280] mt-0.5">{spec.firm}</p>
                  )}

                  <p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                    {spec.specialization}
                  </p>

                  {/* City + hours */}
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#6B7280]">
                    <span>{spec.city}</span>
                    {spec.hours && (
                      <>
                        <span className="text-[#D1D5DB]">/</span>
                        <span className="text-xs">{spec.hours}</span>
                      </>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="flex gap-1.5 mt-2.5">
                    {spec.languages.map((l) => (
                      <span
                        key={l}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          l === locale
                            ? 'bg-[#1A1A2E]/10 text-[#1A1A2E]'
                            : 'bg-[#F5F5F7] text-[#6B7280]'
                        }`}
                      >
                        {LANG_LABELS[l] || l.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3.5">
                    {spec.phone && (
                      <a
                        href={`tel:${spec.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1.5 bg-[#34C759] text-white text-sm font-medium px-4 py-2 rounded-[12px] active:scale-95 transition-transform"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {t('call')}
                      </a>
                    )}
                    {spec.email && (
                      <a
                        href={`mailto:${spec.email}`}
                        className="bg-[#F5F5F7] text-[#1A1A2E] text-sm font-medium px-4 py-2 rounded-[12px] border border-black/[0.06]"
                      >
                        {t('email')}
                      </a>
                    )}
                    {spec.website && (
                      <a
                        href={spec.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F7] text-[#1A1A2E] text-sm font-medium px-4 py-2 rounded-[12px] border border-black/[0.06]"
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
