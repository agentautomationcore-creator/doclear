'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { setOnboardingDone, getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_NAMES, Locale, CountryCode, ImmigrationStatus, COUNTRY_NAMES } from '@/lib/types';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];
const countries: CountryCode[] = ['FR', 'DE', 'IT', 'ES', 'GB', 'NL', 'BE', 'CH', 'AT', 'PT', 'OTHER'];

function CameraIcon() {
  return (
    <svg className="w-16 h-16 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-16 h-16 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.6 9h16.8M3.6 15h16.8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-16 h-16 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

const slides = [
  { icon: 'camera', titleKey: 'slide1_title', descKey: 'slide1_desc' },
  { icon: 'globe', titleKey: 'slide2_title', descKey: 'slide2_desc' },
  { icon: 'calendar', titleKey: 'slide3_title', descKey: 'slide3_desc' },
];

const slideIcons: Record<string, () => JSX.Element> = {
  camera: CameraIcon,
  globe: GlobeIcon,
  calendar: CalendarIcon,
};

const statusOptions: ImmigrationStatus[] = [
  'student',
  'work_permit',
  'residence_permit',
  'family_reunion',
  'tourist',
  'eu_citizen',
  'pending',
  'citizen',
];

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
    setStep(3);
  }

  function selectLanguage(locale: Locale) {
    const settings = getSettings();
    settings.language = locale;
    saveSettings(settings);
    setStep(4);
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
    const IconComponent = slideIcons[slide.icon];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area-inset-top safe-area-inset-bottom bg-white">
        {/* Step dots */}
        <div className="flex gap-2 mb-14">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-[#1A1A2E]' : 'bg-[#D1D5DB]'
              }`}
            />
          ))}
        </div>

        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-8">
            <IconComponent />
          </div>
          <h2 className="text-[28px] font-bold text-[#1A1A2E] mb-3 leading-tight">
            {t(slide.titleKey as any)}
          </h2>
          <p className="text-lg text-[#6B7280] leading-relaxed">
            {t(slide.descKey as any)}
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleNext}
            className="bg-[#1A1A2E] text-white font-semibold py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px]"
          >
            {step === 2 ? t('start') : t('next')}
          </button>
          {step < 2 && (
            <button
              onClick={handleSkip}
              className="text-[#6B7280] py-2 min-h-[44px] text-[15px] hover:text-[#1A1A2E] transition-colors"
            >
              {t('skip')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Language selection (step 3)
  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area-inset-top safe-area-inset-bottom bg-white">
        <h2 className="text-[28px] font-bold text-[#1A1A2E] mb-8">{t('choose_language')}</h2>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => selectLanguage(locale)}
              className="flex items-center gap-3 bg-[#F5F5F7] border border-black/[0.06] hover:border-[#1A1A2E]/30 rounded-[14px] px-4 py-3.5 transition-all min-h-[56px]"
            >
              <span className="font-medium text-[#1A1A2E]">{LOCALE_NAMES[locale]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Country + Status (step 4)
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-14 pb-8 safe-area-inset-top safe-area-inset-bottom bg-white">
      {/* Country */}
      <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-3">
        {t('country_title')}
      </p>
      <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-5">{t('country_title')}</h2>
      <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-10">
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCountry(c)}
            className={`flex items-center justify-center px-3 py-3 rounded-[14px] text-sm font-medium transition-all min-h-[48px] ${
              c === selectedCountry
                ? 'bg-[#1A1A2E]/5 border-2 border-[#1A1A2E] text-[#1A1A2E]'
                : 'bg-[#F5F5F7] border border-black/[0.06] text-[#1A1A2E] hover:border-[#1A1A2E]/20'
            }`}
          >
            <span className="truncate">{c === 'OTHER' ? t('other_country') : COUNTRY_NAMES[c]}</span>
          </button>
        ))}
      </div>

      {/* Status */}
      <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-3">
        {t('status_title')}
      </p>
      <h2 className="text-[22px] font-bold text-[#1A1A2E] mb-5">{t('status_title')}</h2>
      <div className="grid grid-cols-2 gap-2 w-full max-w-md mb-10">
        {statusOptions.map((key) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={`flex items-center px-4 py-3 rounded-[14px] text-sm font-medium transition-all min-h-[48px] ${
              key === selectedStatus
                ? 'bg-[#1A1A2E]/5 border-2 border-[#1A1A2E] text-[#1A1A2E]'
                : 'bg-[#F5F5F7] border border-black/[0.06] text-[#1A1A2E] hover:border-[#1A1A2E]/20'
            }`}
          >
            <span className="truncate">{t(`status_${key}` as any)}</span>
          </button>
        ))}
      </div>

      <button
        onClick={finishOnboarding}
        className="w-full max-w-md bg-[#1A1A2E] text-white font-semibold py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px]"
      >
        {t('start')}
      </button>
    </div>
  );
}
