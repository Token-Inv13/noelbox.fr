import nodemailer from 'nodemailer';

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function getConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || 'Noel Box <noreply@noelbox.fr>';
  if (!host || !user || !pass) return null;
  return { host, port, secure, user, pass, from };
}

let cachedTransport: any | null = null;

export function getTransport(): any | null {
  if (cachedTransport) return cachedTransport;
  const cfg = getConfig();
  if (!cfg) return null;
  cachedTransport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  return cachedTransport;
}

export async function sendOrderConfirmation(to: string, params: {
  orderId: string;
  amount: number;
  currency: string;
  variantLabel?: string | null;
  qty?: string | number | null;
}) {
  const transport = getTransport();
  const cfg = getConfig();
  if (!transport || !cfg) return;
  const amountEuros = (params.amount / 100).toLocaleString('fr-FR', { style: 'currency', currency: (params.currency || 'eur').toUpperCase() });
  const subject = `Confirmation de commande #${params.orderId}`;
  const lines = [
    `Merci pour votre commande !`,
    `Montant: ${amountEuros}`,
    params.variantLabel ? `Coffret: ${params.variantLabel}` : '',
    params.qty ? `Quantité: ${params.qty}` : '',
    `Référence: ${params.orderId}`,
  ].filter(Boolean).join('\n');
  await transport.sendMail({
    from: cfg.from,
    to,
    subject,
    text: lines,
    html: lines.replaceAll('\n', '<br/>'),
  });
}

export default sendOrderConfirmation;
export {};
