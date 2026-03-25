'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';

export default function ScanCounter() {
  const t = useTranslations('settings');
  const tPaywall = useTranslations('paywall');
  const { scanCount, scanLimit, isAuthenticated, isAnonymous, canScan } = useAuth();

  const remaining = Math.max(0, scanLimit - scanCount);
  const pct = Math.min(100, Math.round((scanCount / scanLimit) * 100));
  const isLow = remaining <= 1 && remaining > 0;
  const isExhausted = !canScan;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-[#6B7280]">
          {t('scans_left', { used: scanCount, total: scanLimit })}
        </p>
        {isExhausted && isAnonymous && (
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
