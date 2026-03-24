'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { LOCALE_FLAGS, LOCALE_NAMES, Locale } from '@/lib/types';

const locales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors min-h-[44px]"
        aria-label="Change language"
      >
        <span className="text-sm font-medium text-[#1D1D1F]">{LOCALE_NAMES[locale]}</span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 ltr:right-0 rtl:left-0 bg-[#F5F5F7] rounded-xl shadow-lg border border-[#D2D2D7] py-2 min-w-[180px] z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#EDEDF0] transition-colors min-h-[44px] ${
                l === locale ? 'bg-primary/10 text-primary font-medium' : 'text-[#86868B]'
              }`}
            >
              <span>{LOCALE_NAMES[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
