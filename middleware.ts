import { NextRequest, NextResponse } from 'next/server';

function verify(req: NextRequest): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;
  if (!expectedUser || !expectedPass) return false;
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;
  try {
    const b64 = auth.split(' ')[1] || '';
    const decoded = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');
    return user === expectedUser && pass === expectedPass;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!verify(req)) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
        },
      });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
