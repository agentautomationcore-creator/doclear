'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { isOnboardingDone } from '@/lib/storage';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isOnboarding = pathname.includes('/onboarding');
  const isSettings = pathname.includes('/settings');
  useEffect(() => {
    // Skip onboarding for logged-in users and settings page
    if (!isOnboardingDone() && !isAuthenticated && !isSettings) {
      router.replace('/app/onboarding');
    }
  }, [router, isAuthenticated, isSettings]);

  return (
    <>
      <div className={!isOnboarding ? 'pb-[72px]' : ''}>{children}</div>
      {!isOnboarding && <BottomNav />}
    </>
  );
}
