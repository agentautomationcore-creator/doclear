'use client';

import { useTranslations } from 'next-intl';
import { MAX_FREE_SCANS } from '@/lib/types';

interface Props {
  used: number;
}

export default function ScanCounter({ used }: Props) {
  const t = useTranslations('settings');
  const pct = Math.min(100, Math.round((used / MAX_FREE_SCANS) * 100));

  return (
    <div className="text-sm text-muted">
      <p className="mb-1">
        {t('scans_left', { used, total: MAX_FREE_SCANS })}
      </p>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 80 ? 'bg-danger' : pct >= 60 ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
