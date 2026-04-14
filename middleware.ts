import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(fr|en|ru|ar|it|zh|pt|tr)/:path*', '/((?!api|_next|kaly-privacy|kaly-terms|.*\\..*).*)'],
};
