// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { getCurrentUser } from '@/lib/session';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RGAP - Research Grant Analytics Platform',
  description: 'Analytics platform for Canadian research grants',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user session on the SERVER (Fast, Secure, No Loading Spinner)
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialUser={user || null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
