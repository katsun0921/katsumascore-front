'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import type { TocItem } from '@/lib/toc'
import { messages } from './i18n'
import './TableOfContents.scss'

export type TableOfContentsProps = {
  items: TocItem[]
}

export const TableOfContents = ({ items }: TableOfContentsProps) => {
  const locale = useLocale()
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    // 直前にビューポートを通過した見出しをアクティブにする
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0,
    })

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className='sidebar-toc'>
      <p className='sidebar-toc__heading'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <ol className='sidebar-toc__list'>
        {items.map((item) => (
          <li
            key={item.id}
            className={[
              'sidebar-toc__item',
              item.level === 3 ? 'sidebar-toc__item--h3' : '',
              activeId === item.id ? 'sidebar-toc__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <a href={`#${item.id}`} className='sidebar-toc__link'>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
