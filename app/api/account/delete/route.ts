import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * Delete Account API
 * Removes all user data: documents, chat messages, storage files, and the user account.
 *
 * Demo review account: review@doclear.app / AppReview2026!
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 0. Cancel RevenueCat subscription if exists
    const rcApiKey = process.env.REVENUECAT_API_KEY;
    if (rcApiKey) {
      try {
        await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${rcApiKey}`,
            'Content-Type': 'application/json',
          },
        });
      } catch {
        // RevenueCat cleanup is best-effort — don't block deletion
        console.warn(`Delete account: RevenueCat cleanup failed for ${userId}`);
      }
    }

    // 1. Get all document file URLs for storage cleanup
    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_url')
      .eq('user_id', userId);

    // 2. Delete files from storage
    if (documents && documents.length > 0) {
      const fileUrls = documents
        .map((d) => d.file_url)
        .filter((url): url is string => !!url);

      if (fileUrls.length > 0) {
        await supabase.storage.from('documents').remove(fileUrls);
      }
    }

    // 3. Delete chat messages
    await supabase.from('chat_messages').delete().eq('user_id', userId);

    // 4. Delete documents
    await supabase.from('documents').delete().eq('user_id', userId);

    // 5. Delete usage/profile data
    await supabase.from('profiles').delete().eq('id', userId);

    // 6. Delete the user via admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error(`Delete account: failed to delete user ${userId}:`, deleteError.message);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    console.log(`Delete account: user ${userId} deleted successfully`);
    return NextResponse.json({ deleted: true });
  } catch (error: any) {
    console.error('Delete account error:', error?.message);
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
  }
}
