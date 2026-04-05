import React from 'react'
import type { ReactNode } from 'react'

export type TContainerSize = 'sm' | 'md' | 'xl' | 'full'

export type TContainerProps = {
  children: ReactNode
  size?: TContainerSize
  className?: string
}

const sizeClasses: Record<TContainerSize, string> = {
  sm:   'max-w-[640px]',
  md:   'max-w-[768px]',
  xl:   'max-w-[1200px]',
  full: 'max-w-none',
}

export const Container = ({ children, size = 'xl', className = '' }: TContainerProps) => {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 md:px-8 ${sizeClasses[size]} ${className}`.trim()}>
      {children}
    </div>
  )
}
