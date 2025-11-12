import { NextResponse } from 'next/server';
import getStripe from '@/lib/stripe';
import { saveOrder, type OrderRecord } from '@/lib/orders';
import { sendOrderConfirmation } from '@/lib/email';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const record: OrderRecord = {
      id: session.id,
      date: new Date().toISOString(),
      email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'eur',
      metadata: session.metadata || {},
      payment_status: session.payment_status ?? 'paid',
      processed: false,
    };
    try {
      await saveOrder(record);
      // fire-and-forget email confirmation if SMTP is configured
      if (record.email) {
        try {
          await sendOrderConfirmation(record.email, {
            orderId: record.id,
            amount: record.amount_total,
            currency: record.currency,
            variantLabel: String(record.metadata?.variantLabel || ''),
            qty: record.metadata?.qty || null,
          });
        } catch (e) {
          console.error('[webhook] email send failed', (e as any)?.message || e);
        }
      }
    } catch {
      return NextResponse.json({ error: 'Failed to persist order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
