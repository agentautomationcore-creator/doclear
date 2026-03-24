'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { isOnboardingDone } from '@/lib/storage';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname.includes('/onboarding');
  const isDocView = pathname.includes('/doc/');

  useEffect(() => {
    if (!isOnboardingDone()) {
      router.replace('/app/onboarding');
    }
  }, [router]);

  return (
    <>
      <div className={!isOnboarding && !isDocView ? 'pb-[72px]' : ''}>{children}</div>
      {!isOnboarding && <BottomNav />}
    </>
  );
}
