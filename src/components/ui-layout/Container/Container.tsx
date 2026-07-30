import React from 'react';
import type { ReactNode } from 'react';

export type TContainerSize = 'lg' | 'full'

export type TContainerProps = {
  children: ReactNode
  size?: TContainerSize
  className?: string
}

const sizeClasses: Record<TContainerSize, string> = {
  lg:   'w-[min(100%,var(--layout-width-lg))]',
  full: 'w-full',
};

export const Container = ({ children, size = 'lg', className = '' }: TContainerProps) => {
  return (
    <div data-component='Container' className={`w-full mx-auto px-4 sm:px-6 md:px-8 ${sizeClasses[size]} ${className}`.trim()}>
      {children}
    </div>
  );
};
