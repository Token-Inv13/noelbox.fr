import { NextResponse } from 'next/server';
import { z } from 'zod';
import getStripe from '@/lib/stripe';
import product from '@/data/product.json';
import Stripe from 'stripe';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = ['iad1'];
export const region = 'iad1';

const bodySchema = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(5),
});

export async function POST(req: Request) {
  const rawSite = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  let SITE_URL = rawSite || 'https://noelbox.fr';
  if (!/^https?:\/\//i.test(SITE_URL)) {
    SITE_URL = `https://${SITE_URL}`;
  }
  try {
    // Validate URL and normalize
    const u = new URL(SITE_URL);
    SITE_URL = u.origin;
    const json = await req.json();
    const { variantId, qty } = bodySchema.parse(json);

    const stripe = getStripe();

    const variants = (product as any).variants as Array<any>;
    const variant = variants.find((v) => v.id === variantId);
    if (!variant || !variant.stripePriceId) {
      return NextResponse.json({ error: 'Produit introuvable ou non configuré' }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: variant.stripePriceId,
        quantity: qty,
      },
    ];

    // Preflight: ensure Stripe connectivity and price visibility
    try {
      const priceObj = await stripe.prices.retrieve(variant.stripePriceId);
      if (!priceObj || priceObj.id !== variant.stripePriceId) {
        console.error('[checkout] price mismatch', { got: priceObj?.id });
      }
    } catch (e: any) {
      console.error('[checkout] stripe.prices.retrieve failed', {
        name: e?.name,
        type: e?.type,
        code: e?.code,
        message: e?.message,
      });
      throw e;
    }

    console.log('[checkout] SITE_URL', SITE_URL);

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        allow_promotion_codes: true,
        locale: 'fr',
        success_url: `${SITE_URL}/merci?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}`,
        line_items,
        metadata: {
          variantId,
          variantLabel: variant.label,
          qty: String(qty),
        },
      });
    } catch (e: any) {
      console.error('[checkout] stripe.sessions.create failed', {
        name: e?.name,
        type: e?.type,
        code: e?.code,
        message: e?.message,
      });
      throw e;
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const message = err?.message || 'Checkout error';
    const code = err?.code;
    const type = err?.type;
    console.error('[checkout] error', { message, code, type, SITE_URL });
    return NextResponse.json({ error: message, code, type, SITE_URL, env: { stripeKey: Boolean(process.env.STRIPE_SECRET_KEY), rawSite: rawSite || null }, runtime: { region: process.env.VERCEL_REGION, edge: false } }, { status: 400 });
  }
}
