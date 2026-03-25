'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { migrateFromLocalStorage } from '@/lib/supabaseStorage';
import { getSettings, saveSettings } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

function resetScanCountForLoggedIn() {
  try {
    const settings = getSettings();
    // If user had more scans than guest limit (3), they were a guest who hit limit
    // Reset to 0 so they get fresh 5 scans as registered user
    if (settings.scanCount >= 3) {
      settings.scanCount = 0;
      saveSettings(settings);
    }
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // On login: reset scan count (user gets fresh 5/month) + migrate data
      if (session?.user) {
        resetScanCountForLoggedIn();
        migrateFromLocalStorage().catch(console.error);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        resetScanCountForLoggedIn();
        migrateFromLocalStorage().catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
