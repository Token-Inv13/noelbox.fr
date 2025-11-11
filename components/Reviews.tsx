export default function Reviews() {
  const titleId = "reviews-title";
  const Star = () => (
    <span aria-hidden className="text-[var(--gold)]">★</span>
  );
  const Badge = () => (
    <span className="bg-[color-mix(in_srgb,var(--gold)_18%,white)] text-black rounded-full px-2 py-0.5 text-xs">Achat vérifié</span>
  );
  const Rating = () => (
    <div className="flex items-center gap-0.5" aria-label="5 sur 5">
      <Star /><Star /><Star /><Star /><Star />
    </div>
  );

  const Card = ({ name, text }: { name: string; text: string }) => (
    <div className="bg-white rounded-2xl border border-[var(--gold)]/20 shadow-sm p-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">{name}</div>
        <Badge />
      </div>
      <Rating />
      <p className="text-sm text-[color:var(--text-muted)]">“{text}”</p>
    </div>
  );

  return (
    <section aria-labelledby={titleId} className="max-w-6xl mx-auto px-4 md:px-6">
      <h2 id={titleId} className="font-serif text-2xl md:text-3xl text-center font-semibold">Ils ont adoré ✨</h2>
      <div className="h-0.5 w-12 bg-[var(--gold)]/60 rounded mx-auto mb-4" />
      <p className="text-center text-gray-600 mb-6">Note moyenne 4,9/5 — 214 avis</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card name="Clara M." text="Coffret adorable, reçu en 7 jours. Parfait pour offrir." />
        <Card name="Marc T." text="Qualité au-dessus de mes attentes. L’odeur est douce, très chic." />
        <Card name="Lucie D." text="Exactement comme sur les photos. Ambiance Noël immédiate." />
      </div>
    </section>
  );
}
