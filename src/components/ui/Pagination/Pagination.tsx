import React from 'react'
import './Pagination.scss'

export type TPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

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
    <nav className='c-pagination' aria-label='Page Navigation'>
      <ul className='c-pagination__list'>
        {currentPage > 1 && (
          <li>
            <button
              className='c-pagination__btn c-pagination__btn--prev'
              onClick={() => onPageChange(currentPage - 1)}
              aria-label='Previous page'
            >
              « Prev
            </button>
          </li>
        )}
        {pages.map((page, i) =>
          page === '...' ? (
            <li key={`ellipsis-${i}`}>
              <span className='c-pagination__ellipsis'>...</span>
            </li>
          ) : (
            <li key={page}>
              {page === currentPage ? (
                <span className='c-pagination__btn c-pagination__btn--current' aria-current='page'>
                  {page}
                </span>
              ) : (
                <button
                  className='c-pagination__btn'
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )}
            </li>
          )
        )}
        {currentPage < totalPages && (
          <li>
            <button
              className='c-pagination__btn c-pagination__btn--next'
              onClick={() => onPageChange(currentPage + 1)}
              aria-label='Next page'
            >
              Next »
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
