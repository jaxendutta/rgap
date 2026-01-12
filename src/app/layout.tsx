// src/app/layout.tsx
// Root layout - Authentication is OPTIONAL
// Users can browse all grants, recipients, institutes without logging in
// Auth only needed for: bookmarks, saved searches, account features

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { getCurrentUser } from '@/lib/session';
import Header from '@/components/layout/Header';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Try to get user session - returns null if not logged in (which is fine)
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialUser={user}>
          <Header />

          {children}
        </Providers>
      </body>
    </html>
  );
}
