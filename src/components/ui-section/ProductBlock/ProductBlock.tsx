import Image from 'next/image';
import Link from 'next/link';
import { publicAssetUrl } from '@/libs/publicAssetUrl';

export type TProductType = 'vod' | 'shopping'

export type TProductLink = {
  site: 'amazon_prime' | 'netflix' | 'amazon' | 'rakuten' | string
  url: string
}

export type TProductBlockProps = {
  type: TProductType
  title: string
  description?: string
  imageUrl?: string
  imageAlt?: string
  links: TProductLink[]
}

const VOD_LABELS: Record<string, string> = {
  amazon_prime: 'Amazon Prime Video',
  netflix: 'Netflix',
};

const SHOPPING_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  rakuten: '楽天',
};

const SITE_BG: Record<string, string> = {
  amazon_prime: 'bg-amazon',
  netflix: 'bg-netflix',
  amazon: 'bg-amazon-shopping',
  rakuten: 'bg-rakuten',
};

const borderColor: Record<TProductType, string> = {
  vod: 'border-l-product-vod',
  shopping: 'border-l-product-commerce',
};

export const ProductBlock = ({
  type,
  title,
  description,
  imageUrl,
  imageAlt,
  links,
}: TProductBlockProps) => {
  const siteLabels = type === 'vod' ? VOD_LABELS : SHOPPING_LABELS;
  const linkCta = type === 'vod' ? 'で視聴' : 'で購入';

  return (
    <div
      className={`my-10 border border-color-border-muted border-l-4 ${borderColor[type]} bg-color-bg rounded-md`}
    >
      <div className='flex flex-col gap-4 p-4 md:flex-row'>
        {imageUrl && (
          <div className='flex-shrink-0'>
            <Image
              src={publicAssetUrl(imageUrl)}
              alt={imageAlt || title}
              width={110}
              height={160}
              className='block w-full max-w-[160px] h-auto lg:w-[110px]'
            />
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <span className='inline-block text-caption font-bold px-2 py-1 rounded bg-color-bg-muted text-color-secondary mb-2'>
            {type === 'vod' ? 'VOD' : '買い物'}
          </span>
          <p className='text-body font-bold mb-2 text-color-primary'>
            {title}
          </p>
          {description && (
            <p className='text-ui text-color-secondary mb-3'>
              {description}
            </p>
          )}
          {links.length > 0 && (
            <ul className='flex flex-wrap gap-2 list-none p-0 m-0'>
              {links.map((link, i) => (
                <li key={i}>
                  <Link
                    className={`inline-block text-caption px-3 py-2 text-color-inverse no-underline rounded font-bold transition-opacity duration-150 hover:opacity-85 ${SITE_BG[link.site] ?? 'bg-color-bg-muted'}`}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {(siteLabels[link.site] || link.site) + linkCta}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
