import React from 'react'
import './Badge.scss'

export type TBadgeVariant = 'default' | 'primary' | 'cinema' | 'netflix' | 'amazon' | 'unext'

export type TBadgeProps = {
  label: string
  variant?: TBadgeVariant
}

export const Badge = ({ label, variant = 'default' }: TBadgeProps) => {
  return (
    <span className={['c-badge', `c-badge--${variant}`].join(' ')}>
      {label}
    </span>
  )
}
