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
    <nav className='c-breadcrumb' aria-label='Breadcrumb'>
      <ol className='c-breadcrumb__list'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className='c-breadcrumb__item'>
              {!isLast && item.href ? (
                <a className='c-breadcrumb__link' href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span className='c-breadcrumb__current' aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className='c-breadcrumb__separator' aria-hidden='true'>/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
