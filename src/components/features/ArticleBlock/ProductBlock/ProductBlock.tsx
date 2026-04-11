import React from 'react'
import { publicAssetUrl } from '@/lib/publicAssetUrl'
import './ProductBlock.scss'

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
}

const SHOPPING_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  rakuten: '楽天',
}

export const ProductBlock = ({
  type,
  title,
  description,
  imageUrl,
  imageAlt,
  links,
}: TProductBlockProps) => {
  const siteLabels = type === 'vod' ? VOD_LABELS : SHOPPING_LABELS
  const linkCta = type === 'vod' ? 'で視聴' : 'で購入'

  return (
    <div className={['product', `product--${type}`].join(' ')}>
      <div className='product__inner'>
        {imageUrl && (
          <div className='product__image'>
            <img src={publicAssetUrl(imageUrl)} alt={imageAlt || title} width={110} height='auto' />
          </div>
        )}
        <div className='product__body'>
          <span className='product__type'>{type === 'vod' ? 'VOD' : '買い物'}</span>
          <p className='product__title'>{title}</p>
          {description && <p className='product__desc'>{description}</p>}
          {links.length > 0 && (
            <ul className='product__links'>
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    className={['product__btn', `product__btn--${link.site}`].join(' ')}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {(siteLabels[link.site] || link.site) + linkCta}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
