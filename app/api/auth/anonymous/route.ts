import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Rate-limited anonymous account creation.
 * DS5: Prevents infinite anonymous account abuse.
 * Max 5 anonymous accounts per IP per hour.
 */

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Persistent rate limit: 5 accounts per IP per hour (Supabase RPC)
  const allowed = await checkRateLimit(`anon:${ip}`, 5, 3600);
  if (!allowed) {
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
