import { listOrders, markProcessed } from '@/lib/orders';
import { redirect } from 'next/navigation';

type SearchParams = Promise<{ status?: 'all' | 'processed' | 'pending' }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status = sp.status || 'all';
  const items = await listOrders();

  const filtered = items.filter(({ data }) => {
    if (status === 'processed') return Boolean(data.processed);
    if (status === 'pending') return !data.processed;
    return true;
  });

  async function markAction(formData: FormData) {
    'use server';
    const file = String(formData.get('file') || '');
    if (!file) return;
    await markProcessed(file, true);
    redirect('/admin');
  }

  return (
    <main className="min-h-dvh bg-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin – Commandes</h1>
          <a
            href="/api/admin/export"
            className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Exporter en CSV
          </a>
        </header>

        <nav className="flex gap-2 text-sm">
          <a className={`px-3 py-1 rounded-md border ${status==='all'?'bg-neutral-100':''}`} href="/admin?status=all">Tous</a>
          <a className={`px-3 py-1 rounded-md border ${status==='pending'?'bg-neutral-100':''}`} href="/admin?status=pending">Non traités</a>
          <a className={`px-3 py-1 rounded-md border ${status==='processed'?'bg-neutral-100':''}`} href="/admin?status=processed">Traités</a>
        </nav>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-2 border">Date</th>
                <th className="text-left p-2 border">Email</th>
                <th className="text-left p-2 border">Variant</th>
                <th className="text-left p-2 border">Qté</th>
                <th className="text-left p-2 border">Upsell</th>
                <th className="text-left p-2 border">Montant</th>
                <th className="text-left p-2 border">Statut</th>
                <th className="text-left p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ file, data }) => {
                const m = data.metadata || {};
                return (
                  <tr key={file} className="border-t">
                    <td className="p-2 border align-top">{new Date(data.date).toLocaleString('fr-FR')}</td>
                    <td className="p-2 border align-top">{data.email || ''}</td>
                    <td className="p-2 border align-top">{m.variantLabel || ''}</td>
                    <td className="p-2 border align-top">{m.qty || ''}</td>
                    <td className="p-2 border align-top">{String(m.upsell || '')}</td>
                    <td className="p-2 border align-top">{(data.amount_total/100).toFixed(2)} €</td>
                    <td className="p-2 border align-top">{data.processed ? 'Traité' : 'Non traité'}</td>
                    <td className="p-2 border align-top">
                      {!data.processed && (
                        <form action={markAction}>
                          <input type="hidden" name="file" value={file} />
                          <button className="rounded-md border px-2 py-1 hover:bg-neutral-50">Marquer comme traité</button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-neutral-500">Aucune commande</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
