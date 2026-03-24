import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
