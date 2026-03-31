import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient, validateToken } from '@/lib/supabase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PRICES: Record<string, { amount: number; interval: 'month' | 'year' }> = {
  starter: { amount: 999, interval: 'month' },   // €9.99/month
  pro: { amount: 2499, interval: 'month' },       // €24.99/month
  year: { amount: 9999, interval: 'year' },        // €99.99/year
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, locale } = await request.json();
    const userId = authedUser.id; // NEVER trust client

    if (!plan || !PRICES[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = getStripe();
    const supabase = createServiceClient();

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const priceConfig = PRICES[plan];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: priceConfig.amount,
          recurring: { interval: priceConfig.interval },
          product_data: {
            name: `DocLear ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
            description: plan === 'starter'
              ? '20 documents/month + unlimited chat'
              : 'Unlimited documents + export + 500 pages/doc',
          },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'en'}/app?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale || 'en'}/app`,
      metadata: {
        supabase_user_id: userId,
        plan: plan === 'year' ? 'pro' : plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
