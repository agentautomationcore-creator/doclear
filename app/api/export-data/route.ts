import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, validateToken } from '@/lib/supabase';

/**
 * GDPR Data Export — GET /api/export-data
 * Returns all user data as a downloadable JSON file.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const userId = authedUser.id;

    // Fetch all user data in parallel
    const [docs, messages, profile] = await Promise.all([
      supabase.from('documents').select('*').eq('user_id', userId),
      supabase.from('chat_messages').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).single(),
    ]);

    return NextResponse.json(
      {
        exported_at: new Date().toISOString(),
        user_id: userId,
        profile: profile.data,
        documents: docs.data || [],
        chat_messages: messages.data || [],
      },
      {
        headers: {
          'Content-Disposition': `attachment; filename="doclear-export-${userId}.json"`,
        },
      }
    );
  } catch (error: any) {
    console.error('Export data error:', error?.message);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
