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
  const [isContentEnded, setIsContentEnded] = useState(false)
  const tocRef = useRef<HTMLElement>(null)

  // .p-content の bottom が viewport 上端を抜けたら sticky を解除する
  useEffect(() => {
    const content = document.querySelector('.p-content')
    if (!content) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isPast = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
        setIsContentEnded(isPast)
      },
      { threshold: 0 }
    )

    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  // スクロール進捗を --toc-progress に反映
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      tocRef.current?.style.setProperty('--toc-progress', `${progress}%`)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  // アクティブ制御（画面中央付近で判定・1つだけ）
  useEffect(() => {
    if (items.length === 0) return

    const headings = Array.from(document.querySelectorAll<HTMLElement>('.p-content h2, .p-content h3, .p-content h4'))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    headings.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav
      ref={tocRef}
      className={['toc', !isContentEnded ? 'toc--sticky' : ''].filter(Boolean).join(' ')}
      aria-label={t(messages, ['heading', 'label'], locale)}
    >
      <p className='toc__heading'>{t(messages, ['heading', 'label'], locale)}</p>
      <ol className='toc__list'>
        {items.map((item) => (
          <li
            key={item.id}
            className={[
              'toc__item',
              `toc__item--level-${item.level}`,
              activeId === item.id ? 'toc__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? 'true' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
