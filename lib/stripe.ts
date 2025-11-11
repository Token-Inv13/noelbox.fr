import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  // In dev, we don't throw immediately to allow build, but runtime will fail clearly
  console.warn('[stripe] Missing STRIPE_SECRET_KEY');
}

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const config: Stripe.StripeConfig = {};
    stripe = new Stripe(key as string, config);
  }
  return stripe;
}

export default getStripe;
