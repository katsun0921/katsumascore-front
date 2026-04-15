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
  const [isFixed, setIsFixed] = useState(false)
  const tocRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 固定制御（sentinel が画面外に出たら fixed に切替）
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting)
      },
      {
        rootMargin: '-80px 0px 0px 0px',
        threshold: 0,
      }
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)

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

    const headings = items.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]

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
    <>
      <div ref={sentinelRef} />

      <nav
        ref={tocRef}
        className={['toc', isFixed ? 'toc--fixed is-visible' : ''].filter(Boolean).join(' ')}
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
    </>
  )
}
