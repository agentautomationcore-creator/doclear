import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // STRIPE-6: Deduplication — prevent replay attacks and duplicate processing
    const { error: dedupError } = await supabase
      .from('stripe_webhook_events')
      .insert({ event_id: event.id });
    if (dedupError?.code === '23505') {
      // Duplicate event — already processed
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Reject events older than 5 minutes (timestamp guard)
    const eventAge = Date.now() / 1000 - event.created;
    if (eventAge > 300) {
      return NextResponse.json({ error: 'Event too old' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan || 'starter';

        if (userId) {
          await supabase.from('profiles').update({
            plan,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabase.from('profiles').update({
            plan: 'free',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for customer:', invoice.customer);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error?.message);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
