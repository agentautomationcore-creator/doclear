'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { setOnboardingDone, getSettings, saveSettings } from '@/lib/storage';
import { LOCALE_FLAGS, LOCALE_NAMES, Locale } from '@/lib/types';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

const slides = [
  { icon: '\ud83d\udcf7', titleKey: 'slide1_title', descKey: 'slide1_desc' },
  { icon: '\ud83c\udf10', titleKey: 'slide2_title', descKey: 'slide2_desc' },
  { icon: '\ud83d\udcc5', titleKey: 'slide3_title', descKey: 'slide3_desc' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const t = useTranslations('onboarding');
  const router = useRouter();

  const isLanguageStep = step === slides.length;

  function handleNext() {
    if (step < slides.length) {
      setStep(step + 1);
    }
  }

  function handleSkip() {
    setStep(slides.length);
  }

  function selectLanguage(locale: Locale) {
    const settings = getSettings();
    settings.language = locale;
    saveSettings(settings);
    setOnboardingDone();
    router.replace('/app', { locale });
  }

  if (isLanguageStep) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 safe-area-inset-top safe-area-inset-bottom">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {t('choose_language')}
        </h2>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => selectLanguage(locale)}
              className="flex items-center gap-3 bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary rounded-xl px-4 py-3 transition-colors min-h-[56px]"
            >
              <span className="text-2xl">{LOCALE_FLAGS[locale]}</span>
              <span className="font-medium text-gray-800">
                {LOCALE_NAMES[locale]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const slide = slides[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 safe-area-inset-top safe-area-inset-bottom">
      {/* Dots */}
      <div className="flex gap-2 mb-12">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-8">{slide.icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t(slide.titleKey as any)}
        </h2>
        <p className="text-muted text-lg">{t(slide.descKey as any)}</p>
      </div>

      {/* Buttons */}
      <div className="mt-12 flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={handleNext}
          className="bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]"
        >
          {step === slides.length - 1 ? t('start') : t('next')}
        </button>
        {step < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-muted py-2 min-h-[44px]"
          >
            {t('skip')}
          </button>
        )}
      </div>
    </div>
  );
}
