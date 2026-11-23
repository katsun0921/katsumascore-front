import Image from 'next/image';
import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { SayoArticle } from '@/types/sayo';
import { messages } from './i18n';

export type SayoSearchResultsProps = {
  articles: SayoArticle[];
  /** tags＝候補ボタン（回数を減らさない）／llm＝自由入力 */
  source: 'tags' | 'llm';
  onSummary: (articleId: number) => void;
  className?: string;
};

/** 探した結果の作品一覧（最大3件を想定） */
export const SayoSearchResults = ({ articles, source, onSummary, className }: SayoSearchResultsProps) => {
  const locale = useLocale();
  return (
    <div data-component='SayoSearchResults' className={['sayoSearchResults', className].filter(Boolean).join(' ')}>
      <p className='sayoSearchResults__source'>
        <b>{t(messages, ['source', source], locale)}</b>
        {t(messages, ['source', source === 'tags' ? 'tagsNote' : 'llmNote'], locale)}
      </p>
      <ul className='sayoSearchResults__list'>
        {articles.map((a) => (
          <li key={a.id} className='sayoSearchResults__item'>
            {a.image ? (
              <Image src={a.image} alt='' width={48} height={72} className='sayoSearchResults__thumb' />
            ) : (
              <span className='sayoSearchResults__thumb sayoSearchResults__thumb--empty' aria-hidden='true' />
            )}
            <div className='sayoSearchResults__body'>
              <span className='sayoSearchResults__title'>{a.title}</span>
              <span className='sayoSearchResults__meta'>
                {[a.category, a.score !== undefined ? a.score.toFixed(1) : null, a.vodLabel].filter(Boolean).join(' ・ ')}
              </span>
              {a.moodTags.length > 0 && (
                <span className='sayoSearchResults__tags'>
                  {a.moodTags.map((tag) => <span key={tag}>{tag}</span>)}
                </span>
              )}
            </div>
            <div className='sayoSearchResults__acts'>
              <button type='button' onClick={() => onSummary(a.id)}>{t(messages, ['summary'], locale)}</button>
              <Link href={a.href} locale={linkLocaleForHref(a.href)}>{t(messages, ['read'], locale)}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
