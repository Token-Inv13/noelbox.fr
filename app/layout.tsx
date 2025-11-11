import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import product from "@/data/product.json";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const title = "Mini Coffret Bougies de Noël – Édition Cadeau Premium";
const description = "Coffret de bougies artisanales en cire de soja, style luxe Noël. Livraison rapide 6–10 jours. Idéal pour offrir.";
const keywords = [
  "bougies Noël",
  "coffret cadeau",
  "décoration Noël",
  "cire de soja",
  "idée cadeau Noël",
  "édition premium",
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  themeColor: '#FFF8F1',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/images/hero.jpg`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${SITE_URL}/images/hero.jpg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ldImages = [
    `${SITE_URL}/images/hero.jpg`,
    ...(product.variants?.map(v => `${SITE_URL}${v.image}`) || []),
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: ldImages,
    brand: 'NoëlBox',
    offers: {
      '@type': 'Offer',
      price: '19.90',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
    },
  };

  return (
    <html lang="fr">
      <head>
        <link rel="mask-icon" href="/favicon.svg" color="#D4AF37" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="icon" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FFF8F1" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GTAG_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
