'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_NAMES, Locale, MAX_FREE_SCANS, Settings, CountryCode, ImmigrationStatus, COUNTRY_NAMES } from '@/lib/types';
import ScanCounter from '@/components/ScanCounter';

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
    router.replace('/app/settings', { locale: newLocale });
  }

  function handleEmailSubmit() {
    if (!email.trim()) return;
    console.log('Waitlist email:', email);
    setEmailSent(true);
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
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
            <ScanCounter used={settings.scanCount} />
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
