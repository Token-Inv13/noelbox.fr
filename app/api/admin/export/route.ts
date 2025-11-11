import { NextResponse } from 'next/server';
import { exportCsv } from '@/lib/orders';

export async function GET() {
  const csv = await exportCsv();
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="orders.csv"',
      'cache-control': 'no-store',
    },
  });
}
