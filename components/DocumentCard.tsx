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

  const statusColor =
    doc.status === 'overdue' || doc.status === 'new'
      ? 'text-danger'
      : 'text-success';

  const statusIcon = doc.status === 'done' || doc.status === 'read' ? '\u2705' : '\ud83d\udd34';

  return (
    <Link
      href={`/app/doc/${doc.id}`}
      className="block bg-white border border-[#D2D2D7] rounded-xl p-4 hover:border-[#D2D2D7] transition-colors active:bg-[#F5F5F7]"
    >
      <div className="flex items-start gap-3">
        <span
          className="text-2xl flex-shrink-0 mt-0.5"
          style={{ filter: `drop-shadow(0 0 1px ${cat.color})` }}
        >
          {cat.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1D1D1F] truncate">{doc.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted">
            <span style={{ color: cat.color }}>
              {categories(doc.category as any)}
            </span>
            <span>{'·'}</span>
            <span>
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>

          {hasDeadline && (
            <div
              className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${
                isOverdue ? 'text-danger' : isUrgent ? 'text-danger' : 'text-muted'
              }`}
            >
              <span>\u23f0</span>
              <span>
                {isOverdue
                  ? t('overdue')
                  : daysUntilDeadline === 0
                  ? t('today')
                  : t('days_left', { count: daysUntilDeadline! })}
              </span>
            </div>
          )}

          <div className={`mt-2 text-sm font-medium ${statusColor}`}>
            {statusIcon} {statusT(doc.status as any)}
          </div>
        </div>
      </div>
    </Link>
  );
}
