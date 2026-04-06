export type TPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const btnBase = 'inline-flex items-center justify-center min-w-[36px] h-[36px] px-2 border border-[var(--color-border-muted)] rounded bg-[var(--color-bg)] text-[var(--color-text-primary)] text-[14px] cursor-pointer transition-[background] duration-150 ease-[ease] hover:bg-[var(--color-bg-muted)]'
const btnCurrent = 'inline-flex items-center justify-center min-w-[36px] h-[36px] px-2 border border-[var(--color-primary)] rounded bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-[14px] font-bold cursor-default'
const btnNav = 'inline-flex items-center justify-center min-w-[36px] h-[36px] px-3 border border-[var(--color-border-muted)] rounded bg-[var(--color-bg)] text-[var(--color-text-primary)] text-[13px] cursor-pointer transition-[background] duration-150 ease-[ease] hover:bg-[var(--color-bg-muted)]'
const ellipsis = 'inline-flex items-center justify-center min-w-[36px] h-[36px] text-[var(--color-text-secondary)] text-[14px]'

export const Pagination = ({ currentPage, totalPages, onPageChange }: TPaginationProps) => {
  if (totalPages <= 1) return null

  const midSize = 3
  const startPage = Math.max(1, currentPage - midSize)
  const endPage = Math.min(totalPages, currentPage + midSize)

  const pages: (number | '...')[] = []
  if (startPage > 1) {
    pages.push(1)
    if (startPage > 2) pages.push('...')
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i)
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className='mt-8' aria-label='Page Navigation'>
      <ul className='flex flex-wrap items-center justify-center gap-1 p-0 m-0'>
        {currentPage > 1 && (
          <li>
            <button className={btnNav} onClick={() => onPageChange(currentPage - 1)} aria-label='Previous page'>
              « Prev
            </button>
          </li>
        )}
        {pages.map((page, i) =>
          page === '...' ? (
            <li key={`ellipsis-${i}`}>
              <span className={ellipsis}>...</span>
            </li>
          ) : (
            <li key={page}>
              {page === currentPage ? (
                <span className={btnCurrent} aria-current='page'>{page}</span>
              ) : (
                <button className={btnBase} onClick={() => onPageChange(page as number)}>
                  {page}
                </button>
              )}
            </li>
          )
        )}
        {currentPage < totalPages && (
          <li>
            <button className={btnNav} onClick={() => onPageChange(currentPage + 1)} aria-label='Next page'>
              Next »
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
