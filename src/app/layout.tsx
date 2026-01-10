// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { getSession } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch user session on the SERVER (Fast, Secure, No Loading Spinner)
  const user = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Pass user to Client Providers */}
        <Providers initialUser={user}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
