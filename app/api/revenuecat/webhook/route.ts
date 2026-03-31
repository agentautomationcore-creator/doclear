import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * RevenueCat Webhook Handler
 * Docs: https://www.revenuecat.com/docs/integrations/webhooks
 *
 * Handles subscription lifecycle events from RevenueCat and updates
 * the user's plan in the profiles table accordingly.
 */

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  event_timestamp_ms: number;
  product_id?: string;
  expiration_at_ms?: number;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

const ACTIVATE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

const DEACTIVATE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
]);

export async function POST(request: NextRequest) {
  try {
    // Verify RevenueCat webhook authorization (shared secret)
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('RevenueCat: REVENUECAT_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as RevenueCatWebhookPayload;
    const { event } = body;

    if (!event || !event.type || !event.app_user_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const userId = event.app_user_id;

    if (ACTIVATE_EVENTS.has(event.type)) {
      // Determine plan based on product_id
      let plan = 'pro';
      if (event.product_id?.includes('yearly') || event.product_id?.includes('year')) {
        plan = 'year';
      } else if (event.product_id?.includes('lifetime')) {
        plan = 'lifetime';
      }

      const planExpiresAt = event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          plan,
          plan_expires_at: planExpiresAt,
          rc_customer_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error(`RevenueCat: failed to activate plan for ${userId}:`, error.message);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`RevenueCat: ${event.type} — user ${userId} upgraded to ${plan}, expires ${planExpiresAt}`);
    } else if (event.type === 'CANCELLATION') {
      // CANCELLATION: plan stays active until plan_expires_at
      // A separate cron will set plan='free' after expiration
      const planExpiresAt = event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          plan_expires_at: planExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error(`RevenueCat: failed to update cancellation for ${userId}:`, error.message);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`RevenueCat: CANCELLATION — user ${userId} plan active until ${planExpiresAt}`);
    } else if (DEACTIVATE_EVENTS.has(event.type)) {
      // EXPIRATION or BILLING_ISSUE: immediate downgrade
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'free',
          plan_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error(`RevenueCat: failed to deactivate plan for ${userId}:`, error.message);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`RevenueCat: ${event.type} — user ${userId} downgraded to free`);
    } else {
      // Other events (e.g., TRANSFER, NON_RENEWING_PURCHASE) — log only
      console.log(`RevenueCat: unhandled event ${event.type} for user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('RevenueCat webhook error:', error?.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
