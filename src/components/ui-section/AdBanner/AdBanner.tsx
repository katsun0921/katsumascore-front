import dynamic from 'next/dynamic';
import { WowowSquareBanner, HuluBanner } from '@/components/ui-parts/Affiliate/Accesstrade';
import { DMMAd } from '@/components/ui-parts/Affiliate/A8net';
import './AdBanner.scss';

const Admax = dynamic(() => import('@/components/ui-parts/Affiliate/Admax').then((m) => m.Admax), { ssr: false });

export type AdBannerProps = {
  /** true のときバナーを横並び（TOP 等ワイド枠向け） */
  inline?: boolean;
};

export const AdBanner = ({ inline = false }: AdBannerProps) => {
  const mod = inline ? 'sidebar-ad--bannerInline' : 'sidebar-ad--banner';

  return (
    <div className={`sidebar-ad ${mod}`}>
      <div className='sidebar-ad__item sidebar-ad__item--full'>
        <Admax />
      </div>
      <div className='sidebar-ad__item'>
        <HuluBanner />
      </div>
      <div className='sidebar-ad__item'>
        <WowowSquareBanner />
      </div>
      <div className='sidebar-ad__item'>
        <DMMAd />
      </div>
    </div>
  );
};
