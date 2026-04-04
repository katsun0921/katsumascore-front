import React from 'react'
import type { ReactNode } from 'react'
import './Container.scss'

export type TContainerSize = 'sm' | 'md' | 'lg' | 'full'

export type TContainerProps = {
  children: ReactNode
  size?: TContainerSize
  className?: string
}

export const Container = ({ children, size = 'lg', className }: TContainerProps) => {
  const classes = ['l-container', `l-container--${size}`, className].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}
