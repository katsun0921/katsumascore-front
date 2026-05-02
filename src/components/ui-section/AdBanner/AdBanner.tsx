import { Admax } from '@/components/ui-parts/Affiliate/Admax';
import { WowowSquareBanner } from '@/components/ui-parts/Affiliate/Wowow';

export const AdBanner = () => (
  <div className='sidebar-ad sidebar-ad--banner'>
    <div className='sidebar-ad__item'>
      <Admax />
    </div>
    <div className='sidebar-ad__item'>
      <WowowSquareBanner />
    </div>
  </div>
);
