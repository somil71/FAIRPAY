import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'FAIRPAY // Decentralized Escrow',
  description: 'Multi-milestone escrow on Ethereum. Funds release automatically. Disputes resolve on-chain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[var(--void)] text-[var(--text-primary)] antialiased overflow-x-hidden selection:bg-[var(--copper-glow)] selection:text-[var(--copper-bright)]">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
