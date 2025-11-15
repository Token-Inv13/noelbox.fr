import { promises as fs } from 'fs';
import path from 'path';

export type OrderRecord = {
  id: string; // Stripe session id
  date: string; // ISO
  email?: string | null;
  amount_total: number;
  currency: string;
  metadata: Record<string, any>;
  payment_status: string;
  processed?: boolean;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
      line1?: string | null;
      line2?: string | null;
      postal_code?: string | null;
      state?: string | null;
    } | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
      line1?: string | null;
      line2?: string | null;
      postal_code?: string | null;
      state?: string | null;
    } | null;
  } | null;
};

function ordersBaseDir() {
  // On Vercel, use /tmp for write access
  if (process.env.VERCEL) return '/tmp/orders';
  return path.join(process.cwd(), 'orders');
}

export async function ensureOrdersDir() {
  const dir = ordersBaseDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveOrder(order: OrderRecord) {
  const dir = await ensureOrdersDir();
  const ts = new Date(order.date).getTime();
  const file = path.join(dir, `${ts}-${order.id}.json`);
  await fs.writeFile(file, JSON.stringify(order, null, 2), 'utf8');
  return file;
}

export async function listOrders(): Promise<{ file: string; data: OrderRecord }[]> {
  const dir = await ensureOrdersDir();
  const files = await fs.readdir(dir).catch(() => []);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const results: { file: string; data: OrderRecord }[] = [];
  for (const f of jsonFiles) {
    try {
      const p = path.join(dir, f);
      const raw = await fs.readFile(p, 'utf8');
      const data = JSON.parse(raw) as OrderRecord;
      results.push({ file: p, data });
    } catch {}
  }
  // sort by date desc
  results.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
  return results;
}

export async function markProcessed(filePath: string, processed: boolean) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw) as OrderRecord;
  data.processed = processed;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

export async function exportCsv(): Promise<string> {
  const items = await listOrders();
  const headers = [
    'date',
    'email',
    'variantLabel',
    'qty',
    'upsell',
    'amount_total',
    'currency',
    'payment_status',
    'processed',
  ];
  const lines = [headers.join(',')];
  for (const { data } of items) {
    const m = data.metadata || {};
    const row = [
      data.date,
      data.email ?? '',
      m.variantLabel ?? '',
      m.qty ?? '',
      m.upsell ?? '',
      String(data.amount_total),
      data.currency,
      data.payment_status,
      String(Boolean(data.processed)),
    ];
    lines.push(row.map((x) => String(x).replaceAll('"', '""')).map((x) => `"${x}"`).join(','));
  }
  return lines.join('\n');
}

