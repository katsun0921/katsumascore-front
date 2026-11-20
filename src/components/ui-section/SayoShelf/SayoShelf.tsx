import Image from 'next/image';
import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { SayoArticle } from '@/types/sayo';
import { messages } from './i18n';

export type SayoShelfProps = {
  articles: SayoArticle[];
  /** いま話している作品（印をつけ、「この作品の話を聞く」を出さない） */
  currentId?: number;
  /** 「この作品の話を聞く」。未指定ならボタンを出さない */
  onTalk?: (articleId: number) => void;
  className?: string;
};

/** ノベル画面の「棚」。作品カードを横に並べる */
export const SayoShelf = ({ articles, currentId, onTalk, className }: SayoShelfProps) => {
  const locale = useLocale();
  if (articles.length === 0) return null;
  return (
    <ul data-component='SayoShelf' className={['sayoShelf', className].filter(Boolean).join(' ')} aria-label={t(messages, ['label'], locale)}>
      {articles.map((a) => (
        <li key={a.id} className={`sayoShelf__item${a.id === currentId ? ' sayoShelf__item--current' : ''}`}>
          {a.image ? (
            <Image src={a.image} alt='' width={40} height={60} className='sayoShelf__jacket' />
          ) : (
            <span className='sayoShelf__jacket sayoShelf__jacket--empty' aria-hidden='true' />
          )}
          <span className='sayoShelf__body'>
            <span className='sayoShelf__title'>{a.title}</span>
            <span className='sayoShelf__meta'>
              {[a.category, a.score !== undefined ? a.score.toFixed(1) : null, a.vodLabel].filter(Boolean).join(' ・ ')}
            </span>
            <span className='sayoShelf__acts'>
              <Link href={a.href} locale={linkLocaleForHref(a.href)}>{t(messages, ['read'], locale)}</Link>
              {onTalk && a.id !== currentId && (
                <button type='button' onClick={() => onTalk(a.id)}>{t(messages, ['talk'], locale)}</button>
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};
