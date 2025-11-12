import { NextResponse } from 'next/server';
import { z } from 'zod';
import getStripe from '@/lib/stripe';
import product from '@/data/product.json';
import Stripe from 'stripe';

const bodySchema = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { variantId, qty } = bodySchema.parse(json);

    const stripe = getStripe();

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

    const session = await stripe.checkout.sessions.create({
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

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const message = err?.message || 'Checkout error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
