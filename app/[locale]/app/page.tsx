'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  checkAndUpdateOverdue,
  getDeadlinesThisWeek,
  getSettings,
} from '@/lib/storage';
import { requestNotificationPermission, checkDeadlineNotifications } from '@/lib/notifications';
import { Document, Category } from '@/lib/types';
import DocumentCard from '@/components/DocumentCard';
import DeadlineBanner from '@/components/DeadlineBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ScanCounter from '@/components/ScanCounter';

export default function TimelinePage() {
  const t = useTranslations('timeline');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deadlineCount, setDeadlineCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    const docs = checkAndUpdateOverdue();
    setDocuments(docs);
    setDeadlineCount(getDeadlinesThisWeek().length);
    setScanCount(getSettings().scanCount);

    // Request notifications and check deadlines
    requestNotificationPermission().then((granted) => {
      if (granted) {
        checkDeadlineNotifications(docs, {
          sevenDays: '\ud83d\udcc4 Deadline in 7 days',
          oneDayBefore: '\u26a0\ufe0f Deadline tomorrow',
          todayDeadline: '\ud83d\udd34 Deadline today',
        });
      }
    });
  }, []);

  const filteredDocs = useMemo(() => {
    let result = documents;

    if (filter !== 'all') {
      result = result.filter((d) => d.category === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }

    // Sort: urgent deadlines first, then by date
    return result.sort((a, b) => {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;

      // Done items go to bottom
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (b.status === 'done' && a.status !== 'done') return -1;

      // Items with deadlines first
      if (aDeadline !== Infinity && bDeadline === Infinity) return -1;
      if (bDeadline !== Infinity && aDeadline === Infinity) return 1;

      // Closer deadlines first
      if (aDeadline !== bDeadline) return aDeadline - bDeadline;

      // Otherwise by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, filter, search]);

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#D2D2D7] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-[#1D1D1F]">DocLear</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/app/settings"
              className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Settings"
            >
              <svg className="w-5 h-5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] rounded-xl text-sm text-[#1D1D1F] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Filters */}
        <CategoryFilter selected={filter} onChange={setFilter} />
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <DeadlineBanner count={deadlineCount} />

        <ScanCounter used={scanCount} />

        {filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">\ud83d\udcc4</div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">
              {t('empty_title')}
            </h3>
            <p className="text-muted mb-6">{t('empty_desc')}</p>
            <Link
              href="/app/scan"
              className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
            >
              {t('scan_first')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filteredDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Scan FAB */}
      {filteredDocs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 safe-area-inset-bottom">
          <Link
            href="/app/scan"
            className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          >
            <span className="text-xl">\ud83d\udcf7</span>
            <span>{t('scan')}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
