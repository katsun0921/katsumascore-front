import { Admax } from '@/components/ui-parts/Affiliate/Admax';
import { WowowSquareBanner } from '@/components/ui-parts/Affiliate/Wowow';

export type AdBannerProps = {
  /** true のときバナーを横並び（TOP 等ワイド枠向け） */
  inline?: boolean;
};

export const AdBanner = ({ inline = false }: AdBannerProps) => {
  const mod = inline ? 'sidebar-ad--bannerInline' : 'sidebar-ad--banner';

  return (
    <div className={`sidebar-ad ${mod}`}>
      <div className='sidebar-ad__item'>
        <Admax />
      </div>
      <div className='sidebar-ad__item'>
        <WowowSquareBanner />
      </div>
    </div>
  );
};
