import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RGAP - Research Grant Analytics Platform',
  description: 'Comprehensive analytics platform for Canadian research grants from NSERC, CIHR, and SSHRC',
  keywords: ['research grants', 'NSERC', 'CIHR', 'SSHRC', 'Canada', 'funding', 'analytics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
