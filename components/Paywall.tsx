'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

interface Props {
  type: 'guest_limit' | 'free_limit';
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Paywall({ type }: Props) {
  const t = useTranslations('paywall');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const auth = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: 'starter' | 'pro' | 'year') {
    if (!auth.user) return;
    setLoading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ plan, userId: auth.user.id, locale }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout error:', error);
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  if (type === 'guest_limit') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 safe-area-inset-top safe-area-inset-bottom">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1a56db]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">{t('guest_title')}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{t('guest_desc')}</p>

          <Link
            href="/auth"
            className="block w-full bg-[#1a56db] text-white font-medium py-3.5 rounded-xl hover:bg-[#1a56db]/90 transition-colors mb-3"
          >
            {tAuth('create_account')}
          </Link>

          <Link href="/auth" className="block text-sm text-gray-500 hover:text-[#1A1A2E] py-2">
            {tAuth('sign_in')}
          </Link>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">{t('guest_bonus')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Free limit → pricing plans
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-start px-6 pt-12 pb-6 overflow-y-auto safe-area-inset-top safe-area-inset-bottom">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            You've used your 2 free documents
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Upgrade to continue analyzing documents with AI
          </p>
        </div>

        {/* Starter Plan */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">Starter</h3>
              <p className="text-sm text-gray-500">20 documents/month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1A1A2E]">€9.99</p>
              <p className="text-xs text-gray-400">/month</p>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {['20 documents per month', 'Unlimited chat', 'Document history', 'Health Score analysis'].map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('starter')}
            disabled={loading !== null}
            className="w-full bg-[#1a56db] text-white font-medium py-3.5 rounded-xl hover:bg-[#1a56db]/90 transition-colors disabled:opacity-50"
          >
            {loading === 'starter' ? 'Loading...' : 'Get Starter — €9.99/mo'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#1A1A2E] text-white rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-amber-400 text-[#1A1A2E] text-xs font-bold px-2 py-0.5 rounded-full">
            BEST VALUE
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Pro</h3>
              <p className="text-sm text-white/60">Unlimited documents</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">€24.99</p>
              <p className="text-xs text-white/40">/month</p>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {['Unlimited documents', 'Up to 500 pages per doc', 'PDF export', 'Priority processing', 'Full chat history'].map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleCheckout('pro')}
            disabled={loading !== null}
            className="w-full bg-white text-[#1A1A2E] font-medium py-3.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading === 'pro' ? 'Loading...' : 'Get Pro — €24.99/mo'}
          </button>
        </div>

        {/* Yearly */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-sm font-medium text-green-800 mb-1">
            Save 67% with annual billing
          </p>
          <button
            onClick={() => handleCheckout('year')}
            disabled={loading !== null}
            className="text-sm font-bold text-green-700 underline hover:text-green-800"
          >
            {loading === 'year' ? 'Loading...' : 'Pro Annual — €99.99/year (€8.33/mo)'}
          </button>
        </div>

        {/* Trust signals */}
        <div className="text-center space-y-1 mb-6">
          <p className="text-xs text-gray-400">14-day money-back guarantee</p>
          <p className="text-xs text-gray-400">Cancel in 1 click via Stripe</p>
          <p className="text-xs text-gray-400">Your documents are not used for AI training</p>
          <p className="text-xs text-gray-400">GDPR compliant</p>
        </div>

        <Link href="/app" className="block text-center text-sm text-gray-500 hover:text-[#1A1A2E] py-2">
          {t('back_to_docs')}
        </Link>
      </div>
    </div>
  );
}
