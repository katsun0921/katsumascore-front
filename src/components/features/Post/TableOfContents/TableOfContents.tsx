import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { TocItem } from '@/libs/toc';
import { messages } from './i18n';
export type TableOfContentsProps = {
  items: TocItem[]
}

export const TableOfContents = ({ items }: TableOfContentsProps) => {
  const locale = useLocale();

  if (items.length === 0) return null;

  return (
    <nav
      data-component='TableOfContents'
      className='toc'
      aria-label={t(messages, ['heading', 'label'], locale)}
    >
      <div className='toc__inner'>
        <p className='toc__heading'>{t(messages, ['heading', 'label'], locale)}</p>
        <ol className='toc__list'>
          {items.map((item) => (
            <li key={item.id} className={['toc__item', `toc__item--level-${item.level}`].join(' ')}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};
