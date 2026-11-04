import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { DemoProvider } from '@/context/DemoContext';
import DemoBanner from '@/components/layout/DemoBanner';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BD Battle Pro — Free Fire Esports Tournament Platform',
  description:
    'Premier competitive Free Fire tournament management platform in Bangladesh. Powered by Sifr Esports.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${hindSiliguri.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090D16] text-[#F3F4F6] selection:bg-emerald-500 selection:text-slate-950">
        <DemoProvider>
          <DemoBanner />
          <Suspense fallback={<div className="h-16 bg-[#090D16]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 pb-16 md:pb-0">
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading BD Battle Pro...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </DemoProvider>
      </body>
    </html>
  );
}
