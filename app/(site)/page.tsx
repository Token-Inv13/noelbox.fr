"use client";

import Image from 'next/image';
import Reviews from '@/components/Reviews';
import product from '@/data/product.json';
import { useMemo, useState, useTransition } from 'react';

type Variant = (typeof product)["variants"][number];

export default function Page() {
  const variants: Variant[] = product.variants as any;
  const [variantId, setVariantId] = useState<string>(variants[0]?.id || '');
  const variant = useMemo(() => variants.find(v => v.id === variantId) || variants[0], [variants, variantId]);
  const [qty, setQty] = useState<number>(1);
  const [pending, startTransition] = useTransition();
  const price = variant?.price ?? 12.9;
  const currency = useMemo(() => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }), []);

  async function handleCheckout() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            variantId: variant.id,
            qty,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === 'string' ? data.error : 'Impossible de créer la session de paiement.';
          alert(msg);
          return;
        }
        if (data?.url) {
          window.location.href = data.url as string;
        }
      } catch (e) {
        alert('Une erreur est survenue. Vérifiez votre connexion et réessayez.');
      }
    });
  }

  return (
    <main className="min-h-dvh bg-[#FFF8F1]">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-10 md:space-y-14">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-8 items-center animate-fade-in-up text-center md:text-left">
          <div className="space-y-5 md:space-y-6 mx-auto md:mx-0 max-w-2xl">
            <h1 className="font-serif tracking-wide text-4xl md:text-5xl font-semibold leading-tight">
              Le coffret de bougies Noël le plus mignon de 2025.
            </h1>
            <p className="text-[color:var(--text-muted)]">
              Bougies artisanales en cire de soja, disponibles en 3 coffrets : sapin & bonhomme, gant rouge & flocon, ou sapin rose & gant rose.
            </p>
            <div className="hidden md:block">
              <CTAButton onClick={handleCheckout} disabled={pending} label={`Commander maintenant – ${currency.format(price)}`} />
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-gold border-[3px] border-[var(--gold)]">
            <div className="absolute top-3 right-3 z-10 bg-[var(--gold)] text-black px-3 py-1 rounded-full text-sm shadow">
              Prix spécial
            </div>
            <Image
              src={"/images/hero.jpg"}
              alt="Coffret de bougies de Noël tenu en mains"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </section>

        {/* Galerie (carousel simple en scroll-snap) */}
        <section className="space-y-3 animate-fade-in-up">
          <div
            className="group flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollBehavior: 'smooth' }}
          >
            {['/images/gallery-1.jpg', '/images/gallery-2.jpg', '/images/gallery-3.jpg'].map((src) => (
              <div key={src} className="relative min-w-[85%] md:min-w-[32%] aspect-[4/3] snap-center overflow-hidden rounded-2xl shadow-md border border-[var(--gold)]/40">
                <Image
                  src={src}
                  alt="Coffrets de bougies Noël – galerie"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 85vw"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
            <span className="h-2 w-2 rounded-full bg-[color:color-mix(in_srgb,var(--gold)_30%,transparent)]" />
            <span className="h-2 w-2 rounded-full bg-[color:color-mix(in_srgb,var(--gold)_30%,transparent)]" />
          </div>
        </section>

        {/* Avantages */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm animate-fade-in-up">
          {['Livraison 6–10 jours', 'Cire de soja', 'Prêt à offrir', 'Édition limitée'].map((b) => (
            <div key={b} className="bg-white rounded-2xl shadow-sm px-3 py-2 text-center border border-[var(--gold)]/20">
              <span className="text-[var(--gold)] mr-1">★</span>{b}
            </div>
          ))}
        </section>

        {/* Variantes */}
        <section className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4 border border-[var(--gold)]/20 animate-fade-in-up">
          <h2 className="text-lg font-semibold">Choisissez votre coffret</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {variants.map((v) => (
                <label key={v.id} className="group flex items-center gap-3 p-3 rounded-2xl border hover:bg-neutral-50 cursor-pointer bg-white shadow-sm border-[var(--gold)]/20 hover:border-[var(--gold)]/60 transition-colors">
                  <input
                    type="radio"
                    name="variant"
                    className="accent-red-700"
                    checked={variantId === v.id}
                    onChange={() => setVariantId(v.id)}
                  />
                  <div className="relative w-16 h-16 overflow-hidden rounded-lg border shadow-sm ring-1 ring-[var(--gold)]/50">
                    <Image src={v.image || '/images/variant-placeholder.jpg'} alt={v.label} fill className="object-cover transition-transform duration-200 group-hover:scale-105" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-1 bg-[var(--gold)] rounded" />
                      <div className="font-medium font-serif">{v.label}</div>
                    </div>
                    <div className="text-xs text-neutral-600">{currency.format(v.price)}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label htmlFor="qty" className="w-28">Quantité</label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={5}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                  className="w-20 rounded-md border px-3 py-2"
                />
              </div>
              <div className="pt-2">
                <CTAButton onClick={handleCheckout} disabled={pending} label={`Commander maintenant – ${currency.format(price)}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-[var(--gold)]/15 animate-fade-in-up">
          <h2 className="text-lg font-semibold">Pourquoi on adore</h2>
          <div className="h-0.5 w-12 bg-[var(--gold)]/50 rounded"></div>
          <ul className="list-disc pl-6 text-sm text-neutral-700 space-y-1">
            <li>Décoration de table ou cheminée</li>
            <li>Coffret prêt à offrir</li>
            <li>Style chaleureux et festif</li>
          </ul>
          <div className="h-0.5 w-12 bg-[var(--gold)]/50 rounded"></div>
          <div className="pt-3 text-sm text-neutral-700 space-y-1">
            <p>Cire de soja, combustion propre.</p>
            <p>Durée ≈ 3–5 h par bougie (indicatif).</p>
            <p>Dimensions 4–6 cm selon forme.</p>
            <p>Parfum doux léger.</p>
            <p>Contenu du coffret selon variante choisie.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl shadow p-4 space-y-3 border animate-fade-in-up">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <details className="p-2 border rounded-md"><summary>Délai de livraison ?</summary><div className="text-sm text-neutral-700">6–10 jours ouvrés.</div></details>
          <details className="p-2 border rounded-md"><summary>Parfum ?</summary><div className="text-sm text-neutral-700">Parfum doux léger.</div></details>
          <details className="p-2 border rounded-md"><summary>Prêt à offrir ?</summary><div className="text-sm text-neutral-700">Oui, coffret prêt à offrir.</div></details>
          <details className="p-2 border rounded-md"><summary>Variantes ?</summary><div className="text-sm text-neutral-700">Choix de 4 variantes visuelles.</div></details>
        </section>

        {/* Avis clients */}
        <div className="animate-fade-in-up">
          <Reviews />
        </div>

        {/* Microcopie conversion */}
        <p className="text-center text-sm text-[color:var(--text-muted)]">Un cadeau qui fait toujours plaisir — livraison rapide, édition limitée.</p>

        {/* Footer minimal */}
        <footer className="text-sm text-gray-700 py-8 bg-[#FFF3E0] border-t border-[var(--gold)]/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 items-center justify-center text-center">
              <a href="/legal/mentions" className="underline hover:text-[var(--primary)]">Mentions légales</a>
              <a href="/legal/cgv" className="underline hover:text-[var(--primary)]">CGV</a>
              <a href="/legal/confidentialite" className="underline hover:text-[var(--primary)]">Confidentialité</a>
              <a href="/livraison-retours" className="underline hover:text-[var(--primary)]">Livraison & retours</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky CTA mobile */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/90 backdrop-blur border-t px-4 py-3">
        <button
          onClick={handleCheckout}
          disabled={pending}
          className="w-full inline-flex items-center justify-center rounded-full bg-[var(--primary)] text-white border border-[var(--gold)]/50 font-semibold py-3 px-7 text-lg shadow-md hover:shadow-lg hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.35)] animate-pulse-gold"
        >
          Commander – {currency.format(price)}
        </button>
      </div>
    </main>
  );
}

function CTAButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] text-white border border-[var(--gold)]/50 font-semibold px-7 py-3 text-lg shadow-md hover:shadow-lg hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.35)] animate-pulse-gold"
    >
      {label}
    </button>
  );
}
