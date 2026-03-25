'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';

interface Props {
  type: 'guest_limit' | 'free_limit';
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#34C759] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Paywall({ type }: Props) {
  const t = useTranslations('paywall');
  const tAuth = useTranslations('auth');
  const [showComingSoon, setShowComingSoon] = useState(false);

  if (type === 'guest_limit') {
    // Not logged in, 3 scans used → register
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 safe-area-inset-top safe-area-inset-bottom">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1A1A2E]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">{t('guest_title')}</h2>
          <p className="text-[#6B7280] mb-8 leading-relaxed">{t('guest_desc')}</p>

          <Link
            href="/auth"
            className="block w-full bg-[#1A1A2E] text-white font-medium py-3.5 rounded-[14px] hover:bg-[#2A2A3E] transition-colors mb-3"
          >
            {tAuth('create_account')}
          </Link>

          <Link href="/auth" className="block text-sm text-[#6B7280] hover:text-[#1A1A2E] py-2">
            {tAuth('sign_in')}
          </Link>

          <div className="mt-6 pt-6 border-t border-black/[0.06]">
            <p className="text-xs text-[#6B7280]">{t('guest_bonus')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in, free limit → Pro upsell
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 safe-area-inset-top safe-area-inset-bottom">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A1A2E] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">{t('pro_title')}</h2>
          <p className="text-[#6B7280] leading-relaxed">{t('pro_desc')}</p>
        </div>

        {/* Pro card */}
        <div className="bg-[#1A1A2E] text-white rounded-[20px] p-6 mb-4">
          <p className="text-3xl font-bold mb-1">{t('pro_price')}</p>
          <p className="text-sm text-white/60 mb-5">{t('pro_annual')}</p>
          <ul className="space-y-2.5 mb-6">
            {[t('feature_unlimited'), t('feature_priority'), t('feature_history'), t('feature_export')].map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowComingSoon(true)}
            className="w-full bg-white text-[#1A1A2E] font-medium py-3.5 rounded-[14px] hover:bg-white/90 transition-colors"
          >
            {t('subscribe')}
          </button>
        </div>

        {showComingSoon && (
          <div className="bg-[#F5F5F7] rounded-[14px] p-4 mb-4 text-center">
            <p className="text-sm text-[#6B7280]">{t('coming_soon')}</p>
          </div>
        )}

        <Link href="/app" className="block text-center text-sm text-[#6B7280] hover:text-[#1A1A2E] py-2">
          {t('back_to_docs')}
        </Link>
      </div>
    </div>
  );
}
