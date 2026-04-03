import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';

type PageLayoutProps = {
  children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <Header />
    <main className='relative mx-auto w-[90%] max-w-[1200px] p-0'>
      {children}
    </main>
    <Footer />
  </>
);
