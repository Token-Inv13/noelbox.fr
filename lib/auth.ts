export function verifyBasicAuth(authHeader: string | null): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;
  if (!expectedUser || !expectedPass) return false;
  if (!authHeader?.startsWith('Basic ')) return false;
  try {
    const b64 = authHeader.split(' ')[1] || '';
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');
    return user === expectedUser && pass === expectedPass;
  } catch {
    return false;
  }
}

export function basicWwwAuthenticateHeader(realm = 'Admin Area') {
  return `Basic realm="${realm}", charset="UTF-8"`;
}
