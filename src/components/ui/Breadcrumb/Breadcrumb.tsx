import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

export type TBreadcrumbItem = {
  label: string
  href?: string
}

export type TBreadcrumbProps = {
  items: TBreadcrumbItem[]
}

export const Breadcrumb = ({ items }: TBreadcrumbProps) => {
  const locale = useLocale()
  if (!items.length) return null

  return (
    <nav aria-label={t(messages, ['nav', 'label'], locale)}>
      <ol className='flex flex-wrap items-center gap-1 p-0 m-0 text-[var(--font-size-ui-sm)]'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className='flex items-center gap-1'>
              {!isLast && item.href ? (
                <a className='text-[var(--color-primary)] hover:underline' href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span
                  className='inline-block w-[min(100%,15rem)] overflow-hidden text-ellipsis whitespace-nowrap text-[var(--color-text-secondary)]'
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <span className='text-[var(--color-text-secondary)]' aria-hidden='true'>/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
