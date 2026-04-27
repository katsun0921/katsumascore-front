'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import type { TocItem } from '@/lib/toc'
import { messages } from './i18n'
export type TableOfContentsProps = {
  items: TocItem[]
}

export const TableOfContents = ({ items }: TableOfContentsProps) => {
  const locale = useLocale()
  const [activeId, setActiveId] = useState<string>('')
  const [isContentEnded, setIsContentEnded] = useState(false)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const contentBasePaddingTopRef = useRef<number | null>(null)
  const [isTocAtTop, setIsTocAtTop] = useState(false)
  const isFixed = isTocAtTop && !isContentEnded
  const contentSelector = '#js-content'

  useEffect(() => {
    const placeholder = placeholderRef.current
    const nav = navRef.current
    if (!placeholder || !nav) return
    const content = document.querySelector<HTMLElement>(contentSelector)
    if (!content) return
    const win = placeholder.ownerDocument.defaultView
    if (!win) return

    const onScroll = () => {
      setIsTocAtTop(content.getBoundingClientRect().top <= 60)
    }

    const onResize = () => {
      // リサイズ時はstickyを外した状態でplaceholderの高さを再計算する
      placeholder.style.height = ''
      placeholder.style.height = `${nav.offsetHeight}px`
      onScroll()
    }

    onScroll()
    win.addEventListener('scroll', onScroll, { passive: true })
    win.addEventListener('resize', onResize, { passive: true })
    return () => {
      win.removeEventListener('scroll', onScroll)
      win.removeEventListener('resize', onResize)
    }
  }, [])

  // toc--fixed 時に本文を押し下げてレイアウトジャンプを防ぐ
  useEffect(() => {
    const content = document.querySelector<HTMLElement>(contentSelector)
    const nav = navRef.current
    if (!content || !nav) return

    const win = content.ownerDocument.defaultView
    if (!win) return

    if (contentBasePaddingTopRef.current === null) {
      const basePaddingTop = Number.parseFloat(win.getComputedStyle(content).paddingTop) || 0
      contentBasePaddingTopRef.current = basePaddingTop
    }

    const applyPaddingTop = () => {
      const basePaddingTop = contentBasePaddingTopRef.current ?? 0
      const extraPaddingTop = isFixed ? nav.offsetHeight + 24 * 2 + 56 : 0
      content.style.paddingTop = `${basePaddingTop + extraPaddingTop}px`
    }

    applyPaddingTop()
    win.addEventListener('resize', applyPaddingTop, { passive: true })

    return () => {
      win.removeEventListener('resize', applyPaddingTop)
      content.style.paddingTop = `${contentBasePaddingTopRef.current ?? 0}px`
    }
  }, [isFixed])

  // #js-content の bottom が viewport 上端を抜けたら sticky を解除する（上下スクロールで可逆）
  useEffect(() => {
    const content = document.querySelector<HTMLElement>(contentSelector)
    if (!content) return

    const win = content.ownerDocument.defaultView
    if (!win) return

    const updateContentEnded = () => {
      const navHeight = navRef.current?.offsetHeight ?? 60
      setIsContentEnded(content.getBoundingClientRect().bottom < navHeight)
    }

    updateContentEnded()
    win.addEventListener('scroll', updateContentEnded, { passive: true })
    win.addEventListener('resize', updateContentEnded, { passive: true })

    return () => {
      win.removeEventListener('scroll', updateContentEnded)
      win.removeEventListener('resize', updateContentEnded)
    }
  }, [])

  // toc--fixed 時にアクティブアイテム分だけリスト全体を左へ移動する
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    if (!isFixed) {
      list.style.setProperty('--toc-active-offset', '0px')
      return
    }
    const activeItem = list.querySelector<HTMLElement>('.toc__item--active')
    if (!activeItem) {
      list.style.setProperty('--toc-active-offset', '0px')
      return
    }
    list.style.setProperty('--toc-active-offset', `${activeItem.offsetLeft}px`)
  }, [activeId, isFixed])

// アクティブ制御（画面中央付近で判定・1つだけ）
  useEffect(() => {
    if (items.length === 0) return

    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(`${contentSelector} h2, ${contentSelector} h3, ${contentSelector} h4`),
    )

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
        rootMargin: '-30% 0px -15% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    headings.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <>
      <div ref={placeholderRef} className='toc__placeholder'>
      <nav
        ref={navRef}
        className={['toc', isFixed ? 'toc--fixed' : ''].join(' ')}
        aria-label={t(messages, ['heading', 'label'], locale)}
      >
        <p className='toc__heading'>{t(messages, ['heading', 'label'], locale)}</p>
        <ol ref={listRef} className='toc__list'>
          {items.map((item) => (
            <li
              key={item.id}
              className={[
                'toc__item',
                `toc__item--level-${item.level}`,
                isFixed && activeId === item.id ? 'toc__item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <a
                href={`#${item.id}`}
                aria-current={isFixed && activeId === item.id ? 'true' : undefined}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      </div>
    </>
  )
}
