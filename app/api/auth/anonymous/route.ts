import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * Rate-limited anonymous account creation.
 * DS5: Prevents infinite anonymous account abuse.
 * Max 5 anonymous accounts per IP per hour.
 */

const anonRateLimiter = new Map<string, { count: number; resetAt: number }>();
const ANON_RATE_LIMIT = 5;
const ANON_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkAnonRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = anonRateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    anonRateLimiter.set(ip, { count: 1, resetAt: now + ANON_RATE_WINDOW });
    return true;
  }
  if (entry.count >= ANON_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!checkAnonRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many accounts created. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      app_metadata: { provider: 'anonymous' },
      user_metadata: { ip_hash: hashIP(ip) },
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Generate a session for the anonymous user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `anon-${data.user.id}@doclear.local`,
    });

    if (sessionError) {
      // Fallback: return user ID, client can sign in via signInAnonymously
      return NextResponse.json({
        user_id: data.user.id,
        fallback: true,
      });
    }

    return NextResponse.json({ user_id: data.user.id });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Simple hash to track IP without storing raw IP
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
