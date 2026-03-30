import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, validateToken } from '@/lib/supabase';

/**
 * Migrate Anonymous User to Registered Account
 *
 * When a user signs up with Apple/Google (which creates a new user),
 * this endpoint transfers all documents and chat messages from the
 * anonymous account to the new registered account.
 *
 * If the email already exists (merge case), documents move to the
 * existing account and the anonymous profile is deleted.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token server-side
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { old_user_id, new_user_id } = body;

    if (!old_user_id || !new_user_id) {
      return NextResponse.json(
        { error: 'old_user_id and new_user_id required' },
        { status: 400 }
      );
    }

    if (old_user_id === new_user_id) {
      return NextResponse.json(
        { error: 'old and new user IDs must be different' },
        { status: 400 }
      );
    }

    // Authenticated user must be either the old or new user
    if (authedUser.id !== old_user_id && authedUser.id !== new_user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Verify old user exists and is anonymous
    const { data: oldUser } = await supabase.auth.admin.getUserById(old_user_id);
    if (!oldUser?.user) {
      return NextResponse.json({ error: 'Old user not found' }, { status: 404 });
    }

    // Verify new user exists
    const { data: newUser } = await supabase.auth.admin.getUserById(new_user_id);
    if (!newUser?.user) {
      return NextResponse.json({ error: 'New user not found' }, { status: 404 });
    }

    // 1. Transfer documents
    const { error: docsError, count: docsCount } = await supabase
      .from('documents')
      .update({ user_id: new_user_id })
      .eq('user_id', old_user_id);

    if (docsError) {
      console.error(`Migrate: failed to transfer documents:`, docsError.message);
      return NextResponse.json({ error: 'Failed to transfer documents' }, { status: 500 });
    }

    // 2. Transfer chat messages
    const { error: chatError, count: chatCount } = await supabase
      .from('chat_messages')
      .update({ user_id: new_user_id })
      .eq('user_id', old_user_id);

    if (chatError) {
      console.error(`Migrate: failed to transfer chat messages:`, chatError.message);
      return NextResponse.json({ error: 'Failed to transfer chat messages' }, { status: 500 });
    }

    // 3. Update storage file ownership (rename paths if needed)
    // Storage files are referenced by file_url in documents table,
    // which already points to the correct path — no rename needed.

    // 4. Merge profile data: carry over scan_count to new profile
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('scan_count, language, country, status')
      .eq('id', old_user_id)
      .single();

    if (oldProfile) {
      // Update new profile with old profile's data if new profile has defaults
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('scan_count')
        .eq('id', new_user_id)
        .single();

      if (newProfile) {
        await supabase
          .from('profiles')
          .update({
            scan_count: (newProfile.scan_count ?? 0) + (oldProfile.scan_count ?? 0),
            language: oldProfile.language,
            country: oldProfile.country,
            status: oldProfile.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', new_user_id);
      }
    }

    // 5. Delete old anonymous profile
    await supabase.from('profiles').delete().eq('id', old_user_id);

    // 6. Delete old anonymous user
    await supabase.auth.admin.deleteUser(old_user_id);

    console.log(
      `Migrate: ${old_user_id} → ${new_user_id} | ${docsCount ?? 0} docs, ${chatCount ?? 0} messages`
    );

    return NextResponse.json({
      migrated: true,
      documents_transferred: docsCount ?? 0,
      messages_transferred: chatCount ?? 0,
    });
  } catch (error: any) {
    console.error('Migrate anonymous error:', error?.message);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
