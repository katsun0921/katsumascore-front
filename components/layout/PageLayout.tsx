import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';

type PageLayoutProps = {
  children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <Header />
    <main className="l-container py-8">
      {children}
    </main>
    <Footer />
  </>
);
