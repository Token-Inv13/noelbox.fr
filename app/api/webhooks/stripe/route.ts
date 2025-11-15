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
      customer_details: session.customer_details
        ? {
            email: session.customer_details.email ?? null,
            name: session.customer_details.name ?? null,
            phone: session.customer_details.phone ?? null,
            address: session.customer_details.address
              ? {
                  city: session.customer_details.address.city ?? null,
                  country: session.customer_details.address.country ?? null,
                  line1: session.customer_details.address.line1 ?? null,
                  line2: session.customer_details.address.line2 ?? null,
                  postal_code: session.customer_details.address.postal_code ?? null,
                  state: session.customer_details.address.state ?? null,
                }
              : null,
          }
        : null,
      shipping_details: (session as any).shipping_details
        ? {
            name: (session as any).shipping_details.name ?? null,
            address: (session as any).shipping_details.address
              ? {
                  city: (session as any).shipping_details.address.city ?? null,
                  country: (session as any).shipping_details.address.country ?? null,
                  line1: (session as any).shipping_details.address.line1 ?? null,
                  line2: (session as any).shipping_details.address.line2 ?? null,
                  postal_code: (session as any).shipping_details.address.postal_code ?? null,
                  state: (session as any).shipping_details.address.state ?? null,
                }
              : null,
          }
        : null,
    };
    try {
      await saveOrder(record);
      // fire-and-forget email confirmation if SMTP is configured
      if (record.email) {
        try {
          const qtyRaw = record.metadata?.qty;
          const qtyNum = typeof qtyRaw === 'string' ? parseInt(qtyRaw, 10) : Number(qtyRaw || 1);
          const shippingFree = Number.isFinite(qtyNum) && qtyNum >= 2;
          await sendOrderConfirmation(record.email, {
            orderId: record.id,
            amount: record.amount_total,
            currency: record.currency,
            variantLabel: String(record.metadata?.variantLabel || ''),
            qty: record.metadata?.qty || null,
            shippingFree,
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
