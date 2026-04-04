import React from 'react'
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
    <div className={['c-product', `c-product--${type}`].join(' ')}>
      <div className='c-product__inner'>
        {imageUrl && (
          <div className='c-product__image'>
            <img src={imageUrl} alt={imageAlt || title} width={110} height='auto' />
          </div>
        )}
        <div className='c-product__body'>
          <span className='c-product__type'>{type === 'vod' ? 'VOD' : '買い物'}</span>
          <p className='c-product__title'>{title}</p>
          {description && <p className='c-product__desc'>{description}</p>}
          {links.length > 0 && (
            <ul className='c-product__links'>
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    className={['c-product__btn', `c-product__btn--${link.site}`].join(' ')}
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
