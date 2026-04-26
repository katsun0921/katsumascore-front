import { useEffect, useState } from 'react'
import breakpoints from '@/styles/tokens/breakpoints.json'

export type Layout = 'sm' | 'lg'

/**
 * 現在のビューポート幅に基づいて、レイアウト（sm / lg）を判定する
 * - sm: ビューポート < breakpoints.md（768px）
 * - lg: ビューポート >= breakpoints.md
 */
export const useLayout = (): Layout => {
  const [layout, setLayout] = useState<Layout>(() => {
    // breakpoints.json から px値を数値に変換
    const breakpointValue = parseInt(breakpoints.md, 10)
    const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue}px)`)
    return mediaQuery.matches ? 'lg' : 'sm'
  })

  useEffect(() => {
    // breakpoints.json から px値を数値に変換
    const breakpointValue = parseInt(breakpoints.md, 10)
    const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue}px)`)

    const handleChange = (e: MediaQueryListEvent) => {
      setLayout(e.matches ? 'lg' : 'sm')
    }

    // メディアクエリの変更をリッスン
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return layout
}
