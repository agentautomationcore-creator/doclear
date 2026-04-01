'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  checkAndUpdateOverdue,
} from '@/lib/storage';
import { getDocumentsFromDb } from '@/lib/supabaseStorage';
import { requestNotificationPermission, checkDeadlineNotifications } from '@/lib/notifications';
import { Document, Category } from '@/lib/types';
import DocumentCard from '@/components/DocumentCard';
import DeadlineBanner from '@/components/DeadlineBanner';
import CategoryFilter from '@/components/CategoryFilter';
import ScanCounter from '@/components/ScanCounter';
import { useAuth } from '@/components/AuthProvider';

export default function TimelinePage() {
  const t = useTranslations('timeline');
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deadlineCount, setDeadlineCount] = useState(0);
  useEffect(() => {
    async function loadDocuments() {
      let docs: Document[];

      if (user) {
        // Any user with session (including anonymous): fetch from Supabase
        try {
          docs = await getDocumentsFromDb();
        } catch {
          // Fallback to localStorage only if Supabase fails
          docs = checkAndUpdateOverdue();
        }
      } else {
        // No session at all: use localStorage
        docs = checkAndUpdateOverdue();
      }

      setDocuments(docs);

      // Calculate deadlines from loaded docs (not localStorage)
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = docs.filter((doc) => {
        if (!doc.deadline || doc.status === 'done') return false;
        const d = new Date(doc.deadline);
        return d >= now && d <= weekFromNow;
      });
      setDeadlineCount(upcomingDeadlines.length);

      requestNotificationPermission().then((granted) => {
        if (granted) {
          checkDeadlineNotifications(docs, {
            sevenDays: 'Deadline in 7 days',
            oneDayBefore: 'Deadline tomorrow',
            todayDeadline: 'Deadline today',
          });
        }
      });
    }

    loadDocuments();
  }, [user, isAuthenticated]);

  const filteredDocs = useMemo(() => {
    let result = documents;

    if (filter !== 'all') {
      result = result.filter((d) => d.category === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }

    return result.sort((a, b) => {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;

      if (a.status === 'done' && b.status !== 'done') return 1;
      if (b.status === 'done' && a.status !== 'done') return -1;

      if (aDeadline !== Infinity && bDeadline === Infinity) return -1;
      if (bDeadline !== Infinity && aDeadline === Infinity) return 1;

      if (aDeadline !== bDeadline) return aDeadline - bDeadline;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, filter, search]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] safe-area-inset-top safe-area-inset-bottom">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/[0.06] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-[#1A1A2E] tracking-tight">DocLear</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/app/settings"
              className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Settings"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F7] rounded-[14px] text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/10 transition-shadow"
          />
        </div>

        {/* Filters */}
        <CategoryFilter selected={filter} onChange={setFilter} />
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <DeadlineBanner count={deadlineCount} />

        <ScanCounter />

        {filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-[#6B7280]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
              {t('empty_title')}
            </h3>
            <p className="text-[#6B7280] mb-6 text-sm">{t('empty_desc')}</p>
            <Link
              href="/app/scan"
              className="inline-block bg-[#1A1A2E] text-white font-medium px-6 py-3 rounded-[14px] active:scale-95 transition-transform"
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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/app/scan"
            className="flex items-center gap-2 bg-[#1A1A2E] text-white font-medium px-6 py-3.5 rounded-[14px] shadow-[0_4px_16px_rgba(26,26,46,0.25)] active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <span>{t('scan')}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
