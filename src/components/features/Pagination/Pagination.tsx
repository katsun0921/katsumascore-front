import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export type TPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const btnBase =
  'inline-flex items-center justify-center min-w-[36px] h-[36px] px-2 border border-primary rounded bg-color-bg text-ui text-primary cursor-pointer transition-[background-color,color,border-color] duration-150 ease-[ease] hover:border-transparent hover:bg-primary hover:text-color-inverse';
const btnCurrent =
  'inline-flex items-center justify-center min-w-[36px] h-[36px] px-2 border border-primary rounded bg-primary text-ui font-bold text-color-inverse cursor-default';
const btnNav =
  'inline-flex items-center justify-center min-w-[36px] h-[36px] px-3 border border-primary rounded bg-color-bg [font-size:var(--font-size-ui-sm)] text-primary cursor-pointer transition-[background-color,color,border-color] duration-150 ease-[ease] hover:border-transparent hover:bg-primary hover:text-color-inverse';
const ellipsis = 'inline-flex items-center justify-center min-w-[36px] h-[36px] text-ui text-primary';

export const Pagination = ({ currentPage, totalPages, onPageChange }: TPaginationProps) => {
  const locale = useLocale();
  if (totalPages <= 1) return null;

  const midSize = 3;
  const startPage = Math.max(1, currentPage - midSize);
  const endPage = Math.min(totalPages, currentPage + midSize);

  const pages: (number | '...')[] = [];
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push('...');
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav aria-label={t(messages, ['nav', 'label'], locale)}>
      <ul className='flex flex-wrap items-center justify-center gap-1 p-0 m-0'>
        {currentPage > 1 && (
          <li>
            <button className={btnNav} onClick={() => onPageChange(currentPage - 1)} aria-label={t(messages, ['prev', 'label'], locale)}>
              {t(messages, ['prev', 'text'], locale)}
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
            <button className={btnNav} onClick={() => onPageChange(currentPage + 1)} aria-label={t(messages, ['next', 'label'], locale)}>
              {t(messages, ['next', 'text'], locale)}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
