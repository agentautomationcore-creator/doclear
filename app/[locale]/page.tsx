'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LOCALE_FLAGS, LOCALE_NAMES, Locale } from '@/lib/types';
import LanguageSelector from '@/components/LanguageSelector';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

export default function LandingPage() {
  const t = useTranslations('landing');
  const app = useTranslations('app');

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{app('name')}</span>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          {t('hero_subtitle')}
        </p>
        <Link
          href="/app"
          className="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary/80 transition-colors active:scale-95"
        >
          {t('cta')}
        </Link>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-text-primary mb-10">
          {t('how_title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '\ud83d\udcf7', title: t('step1_title'), desc: t('step1_desc') },
            { icon: '\ud83e\udde0', title: t('step2_title'), desc: t('step2_desc') },
            { icon: '\ud83d\udcc1', title: t('step3_title'), desc: t('step3_desc') },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For who */}
      <section className="bg-card py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {t('for_who_title')}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t('for_who_desc')}
          </p>
        </div>
      </section>

      {/* Languages */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('languages_title')}
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {locales.map((locale) => (
            <div
              key={locale}
              className="flex items-center gap-2 bg-card px-4 py-2 rounded-full"
            >
              <span className="text-2xl">{LOCALE_FLAGS[locale]}</span>
              <span className="text-sm text-text-secondary">{LOCALE_NAMES[locale]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-10">
            {t('pricing_title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text-primary">{t('free_plan')}</h3>
              <p className="text-3xl font-bold text-text-primary my-4">0\u20ac</p>
              <p className="text-muted">{t('free_desc')}</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
              <h3 className="text-xl font-bold text-primary">{t('pro_plan')}</h3>
              <p className="text-3xl font-bold text-text-primary my-4">
                {t('pro_price')}
              </p>
              <p className="text-muted">{t('pro_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Link
          href="/app"
          className="inline-block bg-primary text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-primary/80 transition-colors active:scale-95"
        >
          {t('final_cta')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} DocLear. Growthor.ai</p>
      </footer>
    </div>
  );
}
