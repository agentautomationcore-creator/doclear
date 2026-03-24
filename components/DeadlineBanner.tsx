'use client';

import { useTranslations } from 'next-intl';

interface Props {
  count: number;
}

export default function DeadlineBanner({ count }: Props) {
  const t = useTranslations('timeline');

  if (count === 0) return null;

  return (
    <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 mb-4">
      <p className="text-danger font-medium text-sm">
        \u26a0\ufe0f {t('deadlines_this_week', { count })}
      </p>
    </div>
  );
}
