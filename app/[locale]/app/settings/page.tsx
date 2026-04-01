'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_NAMES, Locale, MAX_FREE_SCANS, Settings, CountryCode, ImmigrationStatus, COUNTRY_NAMES } from '@/lib/types';
import ScanCounter from '@/components/ScanCounter';
import { useAuth } from '@/components/AuthProvider';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];
const countries: CountryCode[] = ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'CH', 'AT', 'PT', 'OTHER'];

function ChevronDown({ open }: { open?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#6B7280] transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const paywallT = useTranslations('paywall');
  const onbT = useTranslations('onboarding');
  const locale = useLocale();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [downloadingData, setDownloadingData] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function toggleNotification(key: 'sevenDays' | 'oneDay' | 'today') {
    if (!settings) return;
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    };
    saveSettings(updated);
    setSettings(updated);
  }

  function switchLanguage(newLocale: Locale) {
    if (!settings) return;
    const updated = { ...settings, language: newLocale };
    saveSettings(updated);
    setSettings(updated);
    setShowLangPicker(false);
    // Full page reload to apply locale globally (prevents stale locale on back navigation)
    window.location.href = `/${newLocale}/app/settings`;
  }

  function handleEmailSubmit() {
    if (!email.trim()) return;
    console.log('Waitlist email:', email);
    setEmailSent(true);
  }

  async function handleDownloadData() {
    setDownloadingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch('/api/export-data', {
        method: 'GET',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doclear-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download data. Please try again.');
    } finally {
      setDownloadingData(false);
    }
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/app')}
            className="p-2 hover:bg-[#F5F5F7] rounded-[10px] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-[#1A1A2E] rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A2E]">{t('title')}</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Language Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('language')}</p>
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center justify-between bg-white py-3.5 px-4 rounded-[14px] border border-black/[0.06] min-h-[52px]"
          >
            <span className="font-medium text-[#1A1A2E]">{LOCALE_NAMES[locale as Locale]}</span>
            <ChevronDown open={showLangPicker} />
          </button>

          {showLangPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLanguage(l)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[12px] transition-all min-h-[44px] ${
                    l === locale
                      ? 'bg-[#1A1A2E]/5 border-2 border-[#1A1A2E]'
                      : 'bg-[#F5F5F7] border border-black/[0.06] hover:border-[#1A1A2E]/20'
                  }`}
                >
                  <span className="text-sm font-medium text-[#1A1A2E]">{LOCALE_NAMES[l]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('country')}</p>
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between bg-white py-3.5 px-4 rounded-[14px] border border-black/[0.06] min-h-[52px]"
          >
            <span className="font-medium text-[#1A1A2E]">
              {settings?.country === 'OTHER' ? onbT('other_country') : COUNTRY_NAMES[settings?.country || 'FR']}
            </span>
            <ChevronDown open={showCountryPicker} />
          </button>

          {showCountryPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {countries.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    if (!settings) return;
                    const updated = { ...settings, country: c };
                    saveSettings(updated);
                    setSettings(updated);
                    setShowCountryPicker(false);
                  }}
                  className={`px-4 py-3 rounded-[12px] text-sm font-medium transition-all min-h-[44px] text-left rtl:text-right ${
                    settings?.country === c
                      ? 'bg-[#1A1A2E]/5 border-2 border-[#1A1A2E] text-[#1A1A2E]'
                      : 'bg-[#F5F5F7] border border-black/[0.06] text-[#1A1A2E] hover:border-[#1A1A2E]/20'
                  }`}
                >
                  {c === 'OTHER' ? onbT('other_country') : COUNTRY_NAMES[c]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('status')}</p>
          <button
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            className="w-full flex items-center justify-between bg-white py-3.5 px-4 rounded-[14px] border border-black/[0.06] min-h-[52px]"
          >
            <span className="font-medium text-[#1A1A2E]">{onbT(`status_${settings?.status || 'residence_permit'}` as any)}</span>
            <ChevronDown open={showStatusPicker} />
          </button>

          {showStatusPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(['student', 'work_permit', 'residence_permit', 'family_reunion', 'tourist', 'eu_citizen', 'pending', 'citizen'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (!settings) return;
                    const updated = { ...settings, status: s };
                    saveSettings(updated);
                    setSettings(updated);
                    setShowStatusPicker(false);
                  }}
                  className={`px-4 py-3 rounded-[12px] text-sm font-medium transition-all min-h-[44px] text-left rtl:text-right ${
                    settings?.status === s
                      ? 'bg-[#1A1A2E]/5 border-2 border-[#1A1A2E] text-[#1A1A2E]'
                      : 'bg-[#F5F5F7] border border-black/[0.06] text-[#1A1A2E] hover:border-[#1A1A2E]/20'
                  }`}
                >
                  {onbT(`status_${s}` as any)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Usage Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('usage')}</p>
          <div className="bg-white rounded-[14px] border border-black/[0.06] p-4">
            <ScanCounter />
          </div>
        </div>

        {/* Reminders Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('reminders')}</p>
          <div className="bg-white rounded-[14px] border border-black/[0.06] divide-y divide-black/[0.06]">
            {([
              { key: 'sevenDays' as const, label: t('reminder_7days') },
              { key: 'oneDay' as const, label: t('reminder_1day') },
              { key: 'today' as const, label: t('reminder_today') },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-3.5 px-4">
                <span className="text-[15px] text-[#1A1A2E]">{label}</span>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`w-[50px] h-[30px] rounded-full transition-colors relative ${
                    settings.notifications[key] ? 'bg-[#1A1A2E]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <div
                    className={`w-[26px] h-[26px] bg-white rounded-full absolute top-[2px] transition-transform shadow-sm ${
                      settings.notifications[key] ? 'ltr:translate-x-[22px] rtl:-translate-x-[22px]' : 'ltr:translate-x-[2px] rtl:-translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Card */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">{t('unlock_pro')}</p>
          <div className="bg-[#F5F5F7] rounded-[20px] p-6 border border-black/[0.06]">
            <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">
              {t('unlock_pro')}
            </h3>
            <p className="text-[#6B7280] text-sm mb-5">{t('pro_price')}</p>
            <ul className="space-y-2.5 mb-5">
              {[t('pro_feature1'), t('pro_feature2'), t('pro_feature3')].map(
                (feature, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-[#1A1A2E]">
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                )
              )}
            </ul>

            {/* Waitlist email */}
            {emailSent ? (
              <p className="text-[#34C759] font-medium text-sm">{paywallT('thanks')}</p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={paywallT('email_placeholder')}
                  className="flex-1 bg-white rounded-[12px] px-4 py-3 text-sm border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/20 text-[#1A1A2E] placeholder:text-[#6B7280]"
                />
                <button
                  onClick={handleEmailSubmit}
                  className="bg-[#1A1A2E] text-white px-5 py-3 rounded-[14px] text-sm font-medium active:scale-95 transition-transform"
                >
                  {paywallT('submit')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Section */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">Account</p>
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="bg-white rounded-[14px] border border-black/[0.06] py-3.5 px-4">
                <p className="text-sm text-[#6B7280]">{user?.email}</p>
              </div>
              <button
                onClick={handleDownloadData}
                disabled={downloadingData}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#1A1A2E] font-medium py-3.5 rounded-[14px] border border-black/[0.06] text-sm hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadingData ? t('downloading') : t('download_my_data')}
              </button>
              <button
                onClick={async () => {
                  // Clear all local data
                  localStorage.removeItem('doclear_settings');
                  localStorage.removeItem('doclear_documents');
                  localStorage.removeItem('doclear_onboarding_done');
                  await signOut();
                  window.location.href = '/';
                }}
                className="w-full bg-[#F5F5F7] text-[#1A1A2E] font-medium py-3.5 rounded-[14px] border border-black/[0.06] text-sm"
              >
                {t('sign_out') || 'Sign out'}
              </button>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-[#DC2626] text-sm py-2"
                >
                  {t('delete_account') || 'Delete my account'}
                </button>
              ) : (
                <div className="bg-[#FEE2E2] rounded-[14px] p-4 border border-[#FECACA]">
                  <p className="text-sm text-[#DC2626] mb-3">{t('delete_confirm') || 'This will permanently delete all your data. Are you sure?'}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const { data: { session } } = await supabase.auth.getSession();
                        const res = await fetch('/api/account/delete', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                          },
                        });
                        if (res.ok) {
                          localStorage.removeItem('doclear_settings');
                          localStorage.removeItem('doclear_documents');
                          localStorage.removeItem('doclear_onboarding_done');
                          await signOut();
                          window.location.href = '/';
                        }
                      }}
                      className="bg-[#DC2626] text-white text-sm font-medium px-4 py-2 rounded-[12px]"
                    >
                      {t('delete_yes') || 'Yes, delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-white text-[#1A1A2E] text-sm font-medium px-4 py-2 rounded-[12px] border border-black/[0.06]"
                    >
                      {t('cancel') || 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Google */}
              <button
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-3 bg-white border border-black/[0.06] rounded-[14px] py-3.5 font-medium text-[#1A1A2E] hover:bg-[#F5F5F7] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t('sign_in_google')}
              </button>
              {/* Apple */}
              <button
                onClick={async () => {
                  const { supabase: sb } = await import('@/lib/supabase');
                  sb.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + '/app' } });
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#1A1A2E] text-white rounded-[14px] py-3.5 font-medium hover:bg-[#2A2A3E] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {t('sign_in_apple') || 'Sign in with Apple'}
              </button>
              {/* Email link */}
              <a
                href="/auth"
                className="block w-full text-center bg-[#F5F5F7] text-[#1A1A2E] rounded-[14px] py-3.5 font-medium border border-black/[0.06] hover:bg-[#EDEDF0] transition-colors"
              >
                {t('sign_in_email') || 'Sign in with Email'}
              </a>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-2 pb-8">
          <div className="space-y-0 rounded-[14px] border border-black/[0.06] divide-y divide-black/[0.06]">
            <a
              href="mailto:hello@growthor.ai"
              className="flex items-center justify-between py-3.5 px-4 text-[#6B7280] hover:text-[#1A1A2E] transition-colors min-h-[44px]"
            >
              <span className="text-[15px]">{t('support')}</span>
              <ChevronRight />
            </a>
            <button className="flex items-center justify-between py-3.5 px-4 text-[#6B7280] hover:text-[#1A1A2E] transition-colors min-h-[44px] w-full text-left rtl:text-right">
              <span className="text-[15px]">{t('terms')}</span>
              <ChevronRight />
            </button>
            <button className="flex items-center justify-between py-3.5 px-4 text-[#6B7280] hover:text-[#1A1A2E] transition-colors min-h-[44px] w-full text-left rtl:text-right">
              <span className="text-[15px]">{t('privacy')}</span>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
