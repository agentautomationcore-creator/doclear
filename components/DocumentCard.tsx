'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Document, Category } from '@/lib/types';
import { getCategoryConfig } from '@/lib/categories';

interface Props {
  document: Document;
}

export default function DocumentCard({ document: doc }: Props) {
  const t = useTranslations('timeline');
  const categories = useTranslations('categories');
  const statusT = useTranslations('status');

  const cat = getCategoryConfig(doc.category);
  const hasDeadline = doc.deadline !== null;
  const daysUntilDeadline = hasDeadline
    ? Math.ceil(
        (new Date(doc.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;

  const isDone = doc.status === 'done' || doc.status === 'read';

  return (
    <Link
      href={`/app/doc/${doc.id}`}
      className="block bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-black/[0.06] p-4 transition-colors active:bg-[#F5F5F7]"
    >
      <div className="flex items-start gap-3">
        {/* Category dot */}
        <div className="flex-shrink-0 mt-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A2E] truncate text-[15px]">{doc.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="text-[12px] font-medium" style={{ color: cat.color }}>
              {categories(doc.category as any)}
            </span>
            <span className="text-[#6B7280]">{'·'}</span>
            <span className="text-[#6B7280] text-[12px]">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>

          {hasDeadline && (
            <div
              className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${
                isOverdue || isUrgent ? 'text-[#DC2626]' : 'text-[#6B7280]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[12px]">
                {isOverdue
                  ? t('overdue')
                  : daysUntilDeadline === 0
                  ? t('today')
                  : t('days_left', { count: daysUntilDeadline! })}
              </span>
            </div>
          )}

          <div className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${isDone ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {isDone ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
            <span className="text-[12px]">{statusT(doc.status as any)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
