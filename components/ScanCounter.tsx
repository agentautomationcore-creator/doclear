'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';
import { MAX_FREE_SCANS, MAX_GUEST_SCANS } from '@/lib/types';

interface Props {
  used: number;
}

export default function ScanCounter({ used }: Props) {
  const t = useTranslations('settings');
  const tPaywall = useTranslations('paywall');
  const { isAuthenticated } = useAuth();

  const limit = isAuthenticated ? MAX_FREE_SCANS : MAX_GUEST_SCANS;
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isLow = remaining <= 1 && remaining > 0;
  const isExhausted = remaining === 0;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-[#6B7280]">
          {t('scans_left', { used, total: limit })}
        </p>
        {isExhausted && !isAuthenticated && (
          <Link href="/auth" className="text-xs font-medium text-[#1A1A2E] hover:underline">
            {tPaywall('guest_bonus')}
          </Link>
        )}
      </div>
      <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: isExhausted ? '#DC2626' : isLow ? '#F59E0B' : '#1A1A2E',
          }}
        />
      </div>
      {isExhausted && isAuthenticated && (
        <p className="text-xs text-[#6B7280] mt-1.5">
          {tPaywall('upgrade_banner')}
        </p>
      )}
    </div>
  );
}
