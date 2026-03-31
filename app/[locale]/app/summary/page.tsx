'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Document, BatchSummary } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categories';
import { supabase } from '@/lib/supabase';

export default function SummaryPage() {
  const t = useTranslations('summary');
  const categories = useTranslations('categories');
  const locale = useLocale();
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('doclear_batch');
    if (!raw) {
      setLoading(false);
      return;
    }

    const batchDocs: Document[] = JSON.parse(raw);
    setDocs(batchDocs);

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ documents: batchDocs, language: locale }),
      })
        .then((r) => r.json())
        .then((data) => setSummary(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-3xl">{'\u23f3'}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-muted mb-4">No batch data</p>
          <Link href="/app" className="text-primary font-medium">
            {t('view_all')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white safe-area-inset-top px-4 py-4">
      <h1 className="text-xl font-bold text-[#1D1D1F] mb-1">{t('title')}</h1>
      <p className="text-sm text-muted mb-6">
        {t('documents_analyzed', { count: summary.totalDocuments })}
      </p>

      {/* By category */}
      {summary.byCategory && (
        <div className="bg-[#F5F5F7] rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            {t('by_category')}
          </h2>
          <div className="space-y-2">
            {Object.entries(summary.byCategory).map(([cat, count]) => {
              const config = getCategoryConfig(cat as any);
              return (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-[#86868B]">{categories(cat as any)}</span>
                  </div>
                  <span className="font-semibold text-[#1D1D1F]">{count as number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Urgent deadlines */}
      {summary.urgentDeadlines && summary.urgentDeadlines.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-danger uppercase tracking-wider mb-3">
            {t('attention')}
          </h2>
          <div className="space-y-2">
            {summary.urgentDeadlines.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{d.urgency === 'high' ? '\ud83d\udd34' : '\ud83d\udfe1'}</span>
                <span className="text-[#1D1D1F] text-sm">{d.title}</span>
                <span className="text-muted text-xs ltr:ml-auto rtl:mr-auto">{d.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finances */}
      {(summary.totalToPay || summary.totalToReceive) && (
        <div className="bg-[#F5F5F7] rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            {t('finances')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {summary.totalToPay && (
              <div>
                <p className="text-xs text-muted">{t('to_pay')}</p>
                <p className="text-lg font-bold text-danger">{summary.totalToPay}</p>
              </div>
            )}
            {summary.totalToReceive && (
              <div>
                <p className="text-xs text-muted">{t('to_receive')}</p>
                <p className="text-lg font-bold text-success">{summary.totalToReceive}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI recommendation */}
      {summary.aiRecommendation && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            {t('recommendation')}
          </h2>
          <p className="text-[#1D1D1F] text-sm leading-relaxed">{summary.aiRecommendation}</p>
        </div>
      )}

      <Link
        href="/app"
        className="block w-full text-center bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform"
      >
        {t('view_all')}
      </Link>
    </div>
  );
}
