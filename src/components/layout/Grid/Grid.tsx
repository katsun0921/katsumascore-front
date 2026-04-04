import React from 'react'
import type { ReactNode } from 'react'
import './Grid.scss'

export type TGridCols = 1 | 2 | 3 | 4

export type TGridProps = {
  children: ReactNode
  cols?: TGridCols
  colsMd?: TGridCols
  colsLg?: TGridCols
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Grid = ({
  children,
  cols = 1,
  colsMd,
  colsLg,
  gap = 'md',
  className,
}: TGridProps) => {
  const classes = [
    'l-grid',
    `l-grid--cols-${cols}`,
    colsMd ? `l-grid--md-cols-${colsMd}` : '',
    colsLg ? `l-grid--lg-cols-${colsLg}` : '',
    `l-grid--gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
