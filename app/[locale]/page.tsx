'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/components/AuthProvider';

export default function LandingPage() {
  const t = useTranslations('landing');
  const tAuth = useTranslations('auth');
  const app = useTranslations('app');
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06]" style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png" alt="DocLear" width={28} height={28} className="rounded-md" />
            <span className="text-lg font-semibold text-[#1A1A2E]">{app('name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {isAuthenticated && user?.email ? (
              <Link href="/app" className="w-8 h-8 bg-[#1A1A2E] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {user.email[0].toUpperCase()}
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-xs sm:text-sm font-medium text-[#6B7280] hover:text-[#1A1A2E] transition-colors whitespace-nowrap">
                  {tAuth('sign_in_short')}
                </Link>
                <Link href="/app" className="bg-[#1A1A2E] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-[14px] hover:bg-[#2A2A3E] transition-colors whitespace-nowrap">
                  {t('cta_short')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#F5F5F7] text-[#6B7280] text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-black/[0.06]">
              {t('badge')}
            </div>
            <h1 className="text-[clamp(32px,5vw,56px)] font-bold text-[#1A1A2E] leading-[1.1] mb-5">
              {t('hero_title')}
            </h1>
            <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-lg">
              {t('hero_subtitle')}
            </p>
            <Link href="/app" className="inline-flex w-full sm:w-auto justify-center bg-[#1A1A2E] text-white font-medium text-base px-8 py-4 rounded-[14px] hover:bg-[#2A2A3E] transition-colors active:scale-[0.98]">
              {t('cta')}
            </Link>
          </div>

          {/* 3D Result Card */}
          <div className="flex justify-center md:justify-end">
            <div className="bg-white rounded-[20px] p-7 max-w-sm w-full" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', transform: 'perspective(1000px) rotateY(-8deg) rotateX(3deg)' }}>
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">{t('card_label')}</div>
              <h3 className="text-base font-bold text-[#1A1A2E] mb-3">{t('card_title')}</h3>
              <div className="border-t border-black/[0.06] pt-3 mb-3">
                <p className="text-sm text-[#6B7280] leading-relaxed">{t('card_body')}</p>
              </div>
              <div className="border-t border-black/[0.06] pt-3 mb-3 space-y-1.5">
                <p className="text-sm text-[#1A1A2E]">1. {t('card_step1')}</p>
                <p className="text-sm text-[#1A1A2E]">2. {t('card_step2')}</p>
                <p className="text-sm text-[#1A1A2E]">3. {t('card_step3')}</p>
              </div>
              <div className="bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-bold px-3 py-2 rounded-lg">{t('card_deadline')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-[#1A1A2E] mb-3">{t('how_title')}</h2>
            <p className="text-lg text-[#6B7280]">{t('how_subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: t('step1_title'), desc: t('step1_desc'), d: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' },
              { step: '02', title: t('step2_title'), desc: t('step2_desc'), d: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
              { step: '03', title: t('step3_title'), desc: t('step3_desc'), d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item, i) => (
              <div key={i} className="relative bg-[#F5F5F7] rounded-[20px] p-8 border border-black/[0.06] hover:-translate-y-1.5 transition-all duration-300" style={{ transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                <div className="absolute top-4 right-6 text-[100px] font-extrabold text-[#EBEBF0] leading-none select-none">{item.step}</div>
                <div className="relative z-10">
                  <svg className="mb-5" width="32" height="32" fill="none" stroke="#1A1A2E" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={item.d}/></svg>
                  <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">{item.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-[#1A1A2E] text-center mb-14">{t('pricing_title')}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white border-2 border-black/[0.06] rounded-[20px] p-8">
              <h3 className="text-2xl font-bold text-[#1A1A2E]">{t('free_plan')}</h3>
              <p className="text-4xl font-bold text-[#1A1A2E] mt-4 mb-2">{'\u20ac'}0</p>
              <p className="text-[#6B7280] mb-6">{t('free_desc_long')}</p>
              <ul className="space-y-2.5">
                {[t('feature_camera'), t('feature_languages'), t('feature_deadlines')].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#1A1A2E]">
                    <svg width="16" height="16" fill="none" stroke="#34C759" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1A1A2E] text-white rounded-[20px] p-8" style={{ boxShadow: '0 20px 60px rgba(26,26,46,0.3)' }}>
              <h3 className="text-2xl font-bold">{t('pro_plan')}</h3>
              <p className="text-4xl font-bold mt-4 mb-1">{t('pro_price')}</p>
              <p className="text-sm text-white/60 mb-6">{t('pro_annual')}</p>
              <ul className="space-y-2.5 mb-8">
                {[t('feature_camera'), t('feature_languages'), t('feature_deadlines'), t('feature_history'), t('feature_priority')].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg width="16" height="16" fill="none" stroke="#34C759" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="block text-center bg-white text-[#1A1A2E] font-medium py-3 rounded-xl hover:bg-white/90 transition-colors">{t('final_cta')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap justify-center gap-4">
          {[t('trust_secure'), t('trust_fast'), t('trust_languages')].map((item, i) => (
            <div key={i} className="bg-[#F5F5F7] text-[#6B7280] text-sm font-medium px-5 py-2.5 rounded-full border border-black/[0.06]">{item}</div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280]">DocLear &mdash; {t('footer_tagline')}</p>
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <span>&copy; {new Date().getFullYear()}</span>
            <Link href="/privacy" className="hover:text-[#1A1A2E] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1A1A2E] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
