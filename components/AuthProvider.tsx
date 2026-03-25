'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;  // true = has email/Google/Apple (not anonymous)
  isAnonymous: boolean;      // true = anonymous session
  scanCount: number;
  scanLimit: number;
  canScan: boolean;
  incrementScan: () => Promise<number>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAnonymous: false,
  scanCount: 0,
  scanLimit: 3,
  canScan: true,
  incrementScan: async () => 0,
  refreshUsage: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  const isAnonymous = user?.app_metadata?.provider === 'anonymous' || !user?.email;
  const isAuthenticated = !!user && !isAnonymous;
  const scanLimit = isAuthenticated ? 5 : 3;
  const canScan = scanCount < scanLimit;

  // Fetch usage from Supabase (single source of truth)
  const refreshUsage = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_usage', { p_user_id: user.id });
      if (error) {
        console.error('get_usage error:', error.message);
        return;
      }
      if (data && data.length > 0) {
        setScanCount(data[0].scan_count);
      } else if (typeof data === 'object' && data !== null && 'scan_count' in data) {
        setScanCount((data as any).scan_count);
      }
    } catch (err) {
      console.error('refreshUsage failed:', err);
    }
  }, [user]);

  // Increment scan count
  const incrementScan = useCallback(async (): Promise<number> => {
    if (!user) {
      // Fallback: localStorage
      try {
        const stored = localStorage.getItem('doclear_settings');
        const settings = stored ? JSON.parse(stored) : { scanCount: 0 };
        settings.scanCount = (settings.scanCount || 0) + 1;
        localStorage.setItem('doclear_settings', JSON.stringify(settings));
        setScanCount(settings.scanCount);
        return settings.scanCount;
      } catch { return 0; }
    }

    try {
      const { data } = await supabase.rpc('increment_scan', { p_user_id: user.id });
      const newCount = typeof data === 'number' ? data : scanCount + 1;
      setScanCount(newCount);
      return newCount;
    } catch {
      // Fallback
      const newCount = scanCount + 1;
      setScanCount(newCount);
      return newCount;
    }
  }, [user, scanCount]);

  useEffect(() => {
    async function initAuth() {
      // 1. Try to get existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        // 2. No session — create anonymous user in background
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (!error && data?.user) {
            setUser(data.user);
            localStorage.setItem('doclear_was_anonymous', 'true');
          }
        }).catch(() => {});
      }
      // Always show page immediately — don't wait for anonymous auth
      setLoading(false);
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        // Only reset scan count on FIRST registration (anonymous → Google/Email)
        // Check if this is a fresh registration (no previous scan data in Supabase)
        if (!session.user.is_anonymous) {
          const wasAnonymous = localStorage.getItem('doclear_was_anonymous');
          if (wasAnonymous === 'true') {
            // First time registering — reset count, give fresh 5 scans
            setScanCount(0);
            try {
              const stored = localStorage.getItem('doclear_settings');
              if (stored) {
                const settings = JSON.parse(stored);
                settings.scanCount = 0;
                localStorage.setItem('doclear_settings', JSON.stringify(settings));
              }
            } catch {}
            localStorage.removeItem('doclear_was_anonymous');
          }
        }
        setTimeout(() => refreshUsage(), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh usage when user changes
  useEffect(() => {
    if (user) {
      refreshUsage();
    } else {
      // No user — read from localStorage
      try {
        const stored = localStorage.getItem('doclear_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          setScanCount(settings.scanCount || 0);
        }
      } catch {}
    }
  }, [user, refreshUsage]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      isAnonymous,
      scanCount,
      scanLimit,
      canScan,
      incrementScan,
      refreshUsage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
