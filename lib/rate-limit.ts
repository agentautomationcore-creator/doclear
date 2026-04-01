import { createServiceClient } from './supabase';

/**
 * Persistent rate limiter using Supabase RPC.
 * Works correctly on Vercel serverless (no in-memory Map).
 *
 * @param key - unique key (e.g. "chat:userId" or "anon:ipHash")
 * @param maxCount - max requests per window
 * @param windowSeconds - window duration in seconds
 * @returns true if allowed, false if rate limited
 */
export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      // Fail-closed: block request if rate limit check fails
      console.error('Rate limit check failed:', error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.error('Rate limit error:', err);
    return false;
  }
}
