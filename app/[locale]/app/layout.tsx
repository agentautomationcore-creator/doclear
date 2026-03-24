'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { isOnboardingDone } from '@/lib/storage';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isOnboardingDone()) {
      router.replace('/app/onboarding');
    }
  }, [router]);

  return <>{children}</>;
}
