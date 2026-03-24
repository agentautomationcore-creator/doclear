'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_FLAGS, LOCALE_NAMES, Locale, MAX_FREE_SCANS, Settings, CountryCode, ImmigrationStatus, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/types';
import ScanCounter from '@/components/ScanCounter';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];
const countries: CountryCode[] = ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'CH', 'AT', 'PT', 'OTHER'];

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
    // In production, send to Google Sheets API
    console.log('Waitlist email:', email);
    setEmailSent(true);
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#D2D2D7] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[#86868B] rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[#1D1D1F]">{t('title')}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Language */}
        <div>
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center justify-between py-3 min-h-[52px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">\ud83c\udf10</span>
              <span className="font-medium text-[#1D1D1F]">{t('language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">{LOCALE_NAMES[locale as Locale]}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${showLangPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showLangPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLanguage(l)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors min-h-[44px] ${
                    l === locale
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-[#F5F5F7] border border-[#D2D2D7]'
                  }`}
                >
                  <span className="text-sm font-medium">{LOCALE_NAMES[l]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Country — dropdown */}
        <div>
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between py-3 min-h-[52px]"
          >
            <span className="font-medium text-[#1D1D1F]">{t('country')}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted">{settings?.country === 'OTHER' ? onbT('other_country') : COUNTRY_NAMES[settings?.country || 'FR']}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {showCountryPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
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
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] text-left rtl:text-right ${
                    settings?.country === c ? 'bg-primary/10 border border-primary/30' : 'bg-[#F5F5F7] border border-[#D2D2D7]'
                  }`}
                >
                  {c === 'OTHER' ? onbT('other_country') : COUNTRY_NAMES[c]}
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Status — dropdown */}
        <div>
          <button
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            className="w-full flex items-center justify-between py-3 min-h-[52px]"
          >
            <span className="font-medium text-[#1D1D1F]">{t('status')}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted">{onbT(`status_${settings?.status || 'residence_permit'}` as any)}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${showStatusPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {showStatusPicker && (
            <div className="grid grid-cols-2 gap-2 mt-2 mb-2">
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
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] text-left rtl:text-right ${
                    settings?.status === s ? 'bg-primary/10 border border-primary/30' : 'bg-[#F5F5F7] border border-[#D2D2D7]'
                  }`}
                >
                  {onbT(`status_${s}` as any)}
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Usage */}
        <div>
          <h3 className="flex items-center gap-2 font-medium text-[#1D1D1F] mb-3">
            <span>\ud83d\udcca</span> {t('usage')}
          </h3>
          <ScanCounter used={settings.scanCount} />
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Reminders */}
        <div>
          <h3 className="flex items-center gap-2 font-medium text-[#1D1D1F] mb-3">
            <span>\ud83d\udd14</span> {t('reminders')}
          </h3>
          <div className="space-y-2">
            {([
              { key: 'sevenDays' as const, label: t('reminder_7days') },
              { key: 'oneDay' as const, label: t('reminder_1day') },
              { key: 'today' as const, label: t('reminder_today') },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-[#86868B]">{label}</span>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings.notifications[key] ? 'bg-primary' : 'bg-[#D2D2D7]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                      settings.notifications[key] ? 'ltr:translate-x-6 rtl:-translate-x-6' : 'ltr:translate-x-1 rtl:-translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Pro */}
        <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
          <h3 className="font-bold text-[#1D1D1F] text-lg mb-1">
            {t('unlock_pro')}
          </h3>
          <p className="text-muted text-sm mb-4">{t('pro_price')}</p>
          <ul className="space-y-2 mb-4">
            {[t('pro_feature1'), t('pro_feature2'), t('pro_feature3')].map(
              (feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#86868B]">
                  <span className="text-success">{'\u2713'}</span>
                  <span>{feature}</span>
                </li>
              )
            )}
          </ul>

          {/* Waitlist email */}
          {emailSent ? (
            <p className="text-success font-medium text-sm">{paywallT('thanks')}</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={paywallT('email_placeholder')}
                className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm border border-[#D2D2D7] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleEmailSubmit}
                className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                {paywallT('submit')}
              </button>
            </div>
          )}
        </div>

        <hr className="border-[#D2D2D7]" />

        {/* Links */}
        <div className="space-y-1">
          <a href="mailto:hello@growthor.ai" className="block py-3 text-[#86868B] min-h-[44px]">
            \ud83d\udce7 {t('support')}
          </a>
          <button className="block py-3 text-[#86868B] min-h-[44px] w-full text-left rtl:text-right">
            \ud83d\udcc4 {t('terms')}
          </button>
          <button className="block py-3 text-[#86868B] min-h-[44px] w-full text-left rtl:text-right">
            \ud83d\udd12 {t('privacy')}
          </button>
        </div>
      </div>
    </div>
  );
}
