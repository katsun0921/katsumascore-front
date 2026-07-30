import type { ReactNode } from 'react';
import { Header } from '@/components/ui-layout/Header';
import { Footer } from '@/components/ui-layout/Footer';

type PageLayoutProps = {
  children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <Header />
    <main data-component='PageLayout' className='relative mx-auto'>
      {children}
    </main>
    <Footer />
  </>
);
