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

    const isAnonymous = oldUser.user.app_metadata?.provider === 'anonymous'
      || !oldUser.user.email;
    if (!isAnonymous) {
      return NextResponse.json({ error: 'Source account is not anonymous' }, { status: 403 });
    }

    // Verify new user exists
    const { data: newUser } = await supabase.auth.admin.getUserById(new_user_id);
    if (!newUser?.user) {
      return NextResponse.json({ error: 'New user not found' }, { status: 404 });
    }

    // MIG-6: Wrap migration in a transaction via Supabase RPC
    // All data transfers happen atomically — rollback on any failure
    const { data: migrationResult, error: migrationError } = await supabase.rpc('migrate_anonymous_user', {
      p_old_user_id: old_user_id,
      p_new_user_id: new_user_id,
    });

    if (migrationError) {
      console.error(`Migrate: transaction failed:`, migrationError.message);
      return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }

    // MIG-4: Move storage files from old_user_id path to new_user_id path
    // Storage RLS checks auth.uid() vs path prefix — files must be under new user's folder
    const { data: docs } = await supabase
      .from('documents')
      .select('id, file_url')
      .eq('user_id', new_user_id)
      .not('file_url', 'is', null);

    let filesMovedCount = 0;
    if (docs) {
      for (const doc of docs) {
        if (doc.file_url && doc.file_url.startsWith(`${old_user_id}/`)) {
          const newPath = doc.file_url.replace(`${old_user_id}/`, `${new_user_id}/`);
          const { error: moveError } = await supabase.storage
            .from('documents')
            .move(doc.file_url, newPath);
          if (!moveError) {
            // Update file_url and image_url in document record
            await supabase
              .from('documents')
              .update({ file_url: newPath, image_url: newPath })
              .eq('id', doc.id)
              .eq('user_id', new_user_id);
            filesMovedCount++;
          } else {
            console.error(`Migrate: failed to move file ${doc.file_url}:`, moveError.message);
          }
        }
      }
    }

    // Delete old anonymous user (profile already deleted in transaction)
    await supabase.auth.admin.deleteUser(old_user_id);

    console.log(
      `Migrate: ${old_user_id} → ${new_user_id} | ${migrationResult?.docs_count ?? 0} docs, ${migrationResult?.msgs_count ?? 0} msgs, ${filesMovedCount} files`
    );

    return NextResponse.json({
      migrated: true,
      documents_transferred: migrationResult?.docs_count ?? 0,
      messages_transferred: migrationResult?.msgs_count ?? 0,
      files_moved: filesMovedCount,
    });
  } catch (error: any) {
    console.error('Migrate anonymous error:', error?.message);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
