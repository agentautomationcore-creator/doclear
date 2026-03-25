'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';
import { getSettings, saveSettings } from '@/lib/storage';

export default function AuthPage() {
  const t = useTranslations('auth');
  const app = useTranslations('app');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);

  function resetScans() {
    const settings = getSettings();
    settings.scanCount = 0;
    saveSettings(settings);
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'register') {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (err) {
        setError(err.message);
      } else if (data?.user) {
        // Auto-confirm is on — go directly to app
        window.location.href = '/app';
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(t('invalid_credentials'));
      } else {
        resetScans();
        window.location.href = '/app';
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    // Try linkIdentity first (for anonymous → registered upgrade)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.app_metadata?.provider === 'anonymous') {
      await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      });
    }
  }

  async function handleApple() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.app_metadata?.provider === 'anonymous') {
      await supabase.auth.linkIdentity({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/app` },
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/app` },
      });
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src="/icon-192.png" alt="DocLear" width={36} height={36} className="rounded-lg" />
          <span className="text-2xl font-bold text-[#1A1A2E]">{app('name')}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1A1A2E] text-center mb-2">
          {mode === 'login' ? t('sign_in') : t('create_account')}
        </h1>
        <p className="text-[#6B7280] text-center mb-8 text-sm">
          {t('subtitle')}
        </p>

        {/* Social buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-black/[0.06] rounded-[14px] py-3.5 font-medium text-[#1A1A2E] hover:bg-[#F5F5F7] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('with_google')}
          </button>

          <button
            onClick={handleApple}
            className="w-full flex items-center justify-center gap-3 bg-[#1A1A2E] text-white rounded-[14px] py-3.5 font-medium hover:bg-[#2A2A3E] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {t('with_apple')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-black/[0.06]" />
          <span className="text-xs text-[#6B7280] uppercase tracking-wider">{t('or')}</span>
          <div className="flex-1 h-px bg-black/[0.06]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email_placeholder')}
            required
            className="w-full bg-[#F5F5F7] rounded-[14px] px-4 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/20"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password_placeholder')}
            required
            minLength={6}
            className="w-full bg-[#F5F5F7] rounded-[14px] px-4 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/20"
          />

          {mode === 'login' && (
            <button
              type="button"
              onClick={async () => {
                if (!email) { setError(t('email_placeholder')); return; }
                setLoading(true);
                const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/auth`,
                });
                setLoading(false);
                if (err) { setError(err.message); }
                else { setSuccess(t('reset_sent')); }
              }}
              className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors self-end"
            >
              {t('forgot_password')}
            </button>
          )}

          {error && <p className="text-[#DC2626] text-sm">{error}</p>}
          {success && <p className="text-[#34C759] text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A2E] text-white font-medium py-3.5 rounded-[14px] hover:bg-[#2A2A3E] transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? t('sign_in') : t('create_account')}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-sm text-[#6B7280] mt-6">
          {mode === 'login' ? t('no_account') : t('have_account')}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            className="text-[#1A1A2E] font-medium hover:underline"
          >
            {mode === 'login' ? t('create_account') : t('sign_in')}
          </button>
        </p>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#6B7280] hover:text-[#1A1A2E]">
            {t('back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
