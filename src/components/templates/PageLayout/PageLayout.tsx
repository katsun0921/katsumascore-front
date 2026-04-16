import type { ReactNode } from 'react';
import { Header } from '@/components/ui-layout/Header/Header';
import { Footer } from '@/components/ui-layout/Footer/Footer';

type PageLayoutProps = {
  children: ReactNode;
};

export const PageLayout = ({ children }: PageLayoutProps) => (
  <>
    <Header />
    <main className='relative mx-auto w-[min(90%,var(--layout-width-xl))] p-0'>
      {children}
    </main>
    <Footer />
  </>
);
