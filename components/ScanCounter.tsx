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
    <div className="text-sm text-[#6B7280]">
      <p className="mb-1">
        {t('scans_left', { used, total: MAX_FREE_SCANS })}
      </p>
      <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? '#DC2626' : '#1A1A2E',
          }}
        />
      </div>
    </div>
  );
}
