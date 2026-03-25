import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function deleteAccount() {
  const user = await getUser();
  if (!user) return;

  // Delete all user documents and profile via cascade
  // The RLS + ON DELETE CASCADE handles cleanup
  await supabase.from('documents').delete().eq('user_id', user.id);
  await supabase.from('profiles').delete().eq('id', user.id);

  // Sign out
  await signOut();
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
