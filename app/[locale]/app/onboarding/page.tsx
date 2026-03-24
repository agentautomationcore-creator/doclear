'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { setOnboardingDone, getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_FLAGS, LOCALE_NAMES, Locale, CountryCode, ImmigrationStatus, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/types';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];
const countries: CountryCode[] = ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'CH', 'AT', 'PT', 'OTHER'];

const slides = [
  { icon: '\ud83d\udcf7', titleKey: 'slide1_title', descKey: 'slide1_desc' },
  { icon: '\ud83c\udf10', titleKey: 'slide2_title', descKey: 'slide2_desc' },
  { icon: '\ud83d\udcc5', titleKey: 'slide3_title', descKey: 'slide3_desc' },
];

const statusOptions: { key: ImmigrationStatus; icon: string }[] = [
  { key: 'student', icon: '\ud83c\udf93' },
  { key: 'work_permit', icon: '\ud83d\udcbc' },
  { key: 'residence_permit', icon: '\ud83c\udfe0' },
  { key: 'family_reunion', icon: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67' },
  { key: 'tourist', icon: '\ud83c\udf0d' },
  { key: 'eu_citizen', icon: '\ud83c\uddea\ud83c\uddfa' },
  { key: 'pending', icon: '\ud83d\udccb' },
  { key: 'citizen', icon: '\ud83c\udfe0' },
];

// Steps: 0-2 slides, 3 language, 4 country+status
const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('FR');
  const [selectedStatus, setSelectedStatus] = useState<ImmigrationStatus>('residence_permit');
  const t = useTranslations('onboarding');
  const router = useRouter();

  function handleNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }

  function handleSkip() {
    setStep(3); // Jump to language
  }

  function selectLanguage(locale: Locale) {
    const settings = getSettings();
    settings.language = locale;
    saveSettings(settings);
    setStep(4); // Go to country+status
  }

  function finishOnboarding() {
    const settings = getSettings();
    settings.country = selectedCountry;
    settings.status = selectedStatus;
    saveSettings(settings);
    setOnboardingDone();
    router.replace('/app', { locale: settings.language });
  }

  // Slides (0-2)
  if (step < 3) {
    const slide = slides[step];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 safe-area-inset-top safe-area-inset-bottom">
        <div className="flex gap-2 mb-12">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-[#D2D2D7]'}`} />
          ))}
        </div>
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-8">{slide.icon}</div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-3">{t(slide.titleKey as any)}</h2>
          <p className="text-muted text-lg">{t(slide.descKey as any)}</p>
        </div>
        <div className="mt-12 flex flex-col gap-3 w-full max-w-sm">
          <button onClick={handleNext} className="bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]">
            {step === 2 ? t('start') : t('next')}
          </button>
          {step < 2 && (
            <button onClick={handleSkip} className="text-muted py-2 min-h-[44px]">{t('skip')}</button>
          )}
        </div>
      </div>
    );
  }

  // Language selection (step 3)
  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 safe-area-inset-top safe-area-inset-bottom">
        <h2 className="text-2xl font-bold text-[#1D1D1F] mb-8">{t('choose_language')}</h2>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => selectLanguage(locale)}
              className="flex items-center gap-3 bg-[#F5F5F7] hover:bg-[#F5F5F7] border border-[#D2D2D7] hover:border-primary rounded-xl px-4 py-3 transition-colors min-h-[56px]"
            >
              <span className="text-2xl">{LOCALE_FLAGS[locale]}</span>
              <span className="font-medium text-[#1D1D1F]">{LOCALE_NAMES[locale]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Country + Status (step 4)
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-12 safe-area-inset-top safe-area-inset-bottom">
      {/* Country */}
      <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">{t('country_title')}</h2>
      <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-8">
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCountry(c)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
              c === selectedCountry
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-[#F5F5F7] border border-[#D2D2D7]'
            }`}
          >
            <span className="text-lg">{COUNTRY_FLAGS[c]}</span>
            <span className="truncate">{c === 'OTHER' ? t('other_country') : COUNTRY_NAMES[c]}</span>
          </button>
        ))}
      </div>

      {/* Status */}
      <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">{t('status_title')}</h2>
      <div className="grid grid-cols-2 gap-2 w-full max-w-md mb-8">
        {statusOptions.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
              key === selectedStatus
                ? 'bg-primary/10 border-2 border-primary'
                : 'bg-[#F5F5F7] border border-[#D2D2D7]'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="truncate">{t(`status_${key}` as any)}</span>
          </button>
        ))}
      </div>

      <button
        onClick={finishOnboarding}
        className="w-full max-w-md bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]"
      >
        {t('start')}
      </button>
    </div>
  );
}
