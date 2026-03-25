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

  // Fetch usage from Supabase
  const refreshUsage = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc('get_usage', { p_user_id: user.id });
      if (data && data.length > 0) {
        setScanCount(data[0].scan_count);
      }
    } catch {
      // Fallback to localStorage if Supabase RPC not available
      try {
        const stored = localStorage.getItem('doclear_settings');
        if (stored) {
          const settings = JSON.parse(stored);
          setScanCount(settings.scanCount || 0);
        }
      } catch {}
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
        setLoading(false);
      } else {
        // 2. No session — create anonymous user
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (!error && data.user) {
            setUser(data.user);
          }
        } catch {
          // Anonymous auth not enabled — fallback to no user
        }
        setLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        // Refresh usage on sign in
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
