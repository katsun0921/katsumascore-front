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
    <nav aria-label='Breadcrumb'>
      <ol className='flex flex-wrap items-center gap-1 p-0 m-0 text-[13px]'>
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
                  className='text-[var(--color-text-secondary)] max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap'
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
