import type { ReactNode } from 'react';
import { Header } from '@/stories/layouts/Header/Header';
import { Footer } from '@/stories/layouts/Footer/Footer';

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
