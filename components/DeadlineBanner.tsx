'use client';

import { useTranslations } from 'next-intl';

interface Props {
  count: number;
}

export default function DeadlineBanner({ count }: Props) {
  const t = useTranslations('timeline');

  if (count === 0) return null;

  return (
    <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-[14px] px-4 py-3 mb-4 flex items-center gap-2.5">
      <svg className="w-4 h-4 text-[#DC2626] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-[#DC2626] font-medium text-sm">
        {t('deadlines_this_week', { count })}
      </p>
    </div>
  );
}
