// src/app/layout.tsx
// Root layout - Authentication is OPTIONAL
// Users can browse all grants, recipients, institutes without logging in
// Auth only needed for: bookmarks, saved searches, account features

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { getCurrentUser } from '@/lib/session';
import MainLayout from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RGAP - Research Grant Analytics Platform',
  description: 'Browse Canadian research grants from NSERC, CIHR, and SSHRC',
  keywords: ['research grants', 'NSERC', 'CIHR', 'SSHRC', 'Canada'],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
    other: {
      rel: 'icon',
      url: '/favicon.png',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://rgap.anirban.ca',
    title: 'RGAP - Research Grant Analytics Platform',
    description: 'Browse Canadian research grants from NSERC, CIHR, and SSHRC',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* beforeInteractive so registration fires as soon as the browser
            parses this tag, not after React hydrates -- PWA crawlers
            (e.g. PWABuilder) check for a service worker before hydration
            completes and won't see a registration made from a useEffect. */}
        <Script id="register-sw" strategy="beforeInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
        <Providers initialUser={user} key={user?.id || 'anonymous'}>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
