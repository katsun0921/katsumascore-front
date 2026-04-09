import React from 'react'
import type { ReactNode } from 'react'

export type TContainerSize = 'sm' | 'md' | 'xl' | 'full'

export type TContainerProps = {
  children: ReactNode
  size?: TContainerSize
  className?: string
}

const sizeClasses: Record<TContainerSize, string> = {
  sm:   'w-[min(100%,var(--layout-width-sm))]',
  md:   'w-[min(100%,var(--layout-width-md))]',
  xl:   'w-[min(100%,var(--layout-width-xl))]',
  full: 'w-full',
}

export const Container = ({ children, size = 'xl', className = '' }: TContainerProps) => {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 md:px-8 ${sizeClasses[size]} ${className}`.trim()}>
      {children}
    </div>
  )
}
