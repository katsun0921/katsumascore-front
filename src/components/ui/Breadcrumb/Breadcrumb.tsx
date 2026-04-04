import React from 'react'
import './Breadcrumb.scss'

export type TBreadcrumbItem = {
  label: string
  href?: string
}

export type TBreadcrumbProps = {
  items: TBreadcrumbItem[]
}

export const Breadcrumb = ({ items }: TBreadcrumbProps) => {
  if (!items.length) return null

  return (
    <nav className='breadcrumb' aria-label='Breadcrumb'>
      <ol className='breadcrumb__list'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className='breadcrumb__item'>
              {!isLast && item.href ? (
                <a className='breadcrumb__link' href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span className='breadcrumb__current' aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className='breadcrumb__separator' aria-hidden='true'>/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
