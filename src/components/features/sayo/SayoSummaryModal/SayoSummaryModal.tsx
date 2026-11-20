import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { SAYO_FACE_SRC } from '@/libs/sayoAssets';
import { SayoBubble } from '@/components/ui-parts/SayoBubble';
import { SayoDeepButton } from '@/components/ui-parts/SayoDeepButton';
import { SayoSummary } from '@/components/ui-section/SayoSummary';
import { SayoSearchResults } from '@/components/ui-section/SayoSearchResults';
import { SayoPausedNotice } from '@/components/ui-section/SayoPausedNotice';
import { useSayo } from '@/components/features/sayo/useSayo';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { useArticleSummary } from './useArticleSummary';
import { messages } from './i18n';

const Typing = () => (
  <span className='sayoSummaryModal__typing' role='status' aria-label='…'>
    <i /><i /><i />
  </span>
);

/**
 * 要約モーダル（作品の要約／探した結果）。SayoProvider が開閉する。
 * PCは中央、SPは下からのシート。Esc で閉じ、←→ で前後の作品。
 */
export const SayoSummaryModal = () => {
  const sayo = useSayo();
  const locale = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { modal } = sayo;
  const postId = modal && modal.kind === 'summary' ? modal.ids[modal.index] : null;
  const { summary, loading, failed } = useArticleSummary(sayo.client, postId);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [postId, modal?.kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.tagName === 'INPUT';
      if (e.key === 'Escape') sayo.closeAll();
      if (e.key === 'ArrowLeft' && !typing) sayo.step(-1);
      if (e.key === 'ArrowRight' && !typing) sayo.step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sayo]);

  if (!modal) return null;
  const search = modal.kind === 'search' ? modal.search : null;
  const scopeLabel = sayo.category ? `${sayo.category}${t(messages, ['searchHead', 'scoped'], locale)}` : t(messages, ['searchHead', 'all'], locale);
  const article = summary?.article;

  const header = search ? (
    <>
      <Image src={SAYO_FACE_SRC} alt='' width={56} height={76} className='sayoSummaryModal__thumb' />
      <div className='sayoSummaryModal__meta'>
        <p className='sayoSummaryModal__cat'>{t(messages, ['searchHead', 'label'], locale)} ・ {scopeLabel}</p>
        <h2 className='sayoSummaryModal__title' id='sayoModalTitle'>「{search.query}」</h2>
      </div>
    </>
  ) : (
    <>
      {article?.image ? (
        <Image src={article.image} alt='' width={56} height={76} className='sayoSummaryModal__thumb' />
      ) : (
        <span className='sayoSummaryModal__thumb sayoSummaryModal__thumb--empty' aria-hidden='true' />
      )}
      <div className='sayoSummaryModal__meta'>
        <p className='sayoSummaryModal__cat'>{article?.category ?? ''}</p>
        <h2 className='sayoSummaryModal__title' id='sayoModalTitle'>{article?.title ?? t(messages, ['loading'], locale)}</h2>
        {article && (
          <p className='sayoSummaryModal__info'>
            {article.score !== undefined && <span className='sayoSummaryModal__score'>{article.score.toFixed(1)}</span>}
            {article.vodLabel && <span>{article.vodLabel}{article.vodCheckedAt ? `（${article.vodCheckedAt}時点）` : ''}</span>}
          </p>
        )}
      </div>
    </>
  );

  const searchBody = search && (
    <>
      <SayoBubble speaker='user'>{search.query}</SayoBubble>
      {search.failure === 'closed' && <SayoPausedNotice reason='closed' />}
      {search.failure === 'error' && <p className='sayoSummaryModal__error' role='alert'>{t(messages, ['error'], locale)}</p>}
      {!search.failure && !search.result && <SayoBubble><Typing /></SayoBubble>}
      {search.result && (
        <>
          <SayoBubble>{search.result.reply}</SayoBubble>
          {search.result.articles.length > 0 && (
            <>
              <SayoSearchResults articles={search.result.articles} source={search.result.source} onSummary={sayo.showSummaryInSearch} />
              <SayoDeepButton title={t(messages, ['deep', 'search'], locale)} description={t(messages, ['deep', 'searchSub'], locale)} onClick={sayo.openNovel} />
            </>
          )}
        </>
      )}
      <div className='sayoSummaryModal__more'>
        <p>{t(messages, ['others'], locale)}</p>
        <div className='sayoSummaryModal__chips'>
          {sayo.chips.filter((c) => c !== search.query).map((c) => (
            <button key={c} type='button' onClick={() => sayo.openSearch(c, 'chip')}>{c}</button>
          ))}
        </div>
      </div>
    </>
  );

  const summaryBody = !search && (
    <>
      {loading && <SayoBubble><Typing /></SayoBubble>}
      {failed && <p className='sayoSummaryModal__error' role='alert'>{t(messages, ['error'], locale)}</p>}
      {summary && (
        <>
          <SayoSummary summary={summary} />
          <SayoDeepButton
            title={`『${summary.article.title}』${t(messages, ['deep', 'postSuffix'], locale)}`}
            description={t(messages, ['deep', 'postSub'], locale)}
            onClick={sayo.openNovel}
          />
        </>
      )}
    </>
  );

  const isSummary = modal.kind === 'summary';
  return (
    <div data-component='SayoSummaryModal' className='sayoSummaryModal'>
      <div className='sayoSummaryModal__scrim' onClick={sayo.closeAll} aria-hidden='true' />
      <section className='sayoSummaryModal__sheet' role='dialog' aria-modal='true' aria-labelledby='sayoModalTitle'>
        <div className='sayoSummaryModal__grab' aria-hidden='true' />
        <header className='sayoSummaryModal__head'>
          {header}
          <button ref={closeRef} type='button' className='sayoSummaryModal__close' onClick={sayo.closeAll} aria-label={t(messages, ['close'], locale)}>✕</button>
        </header>
        <div ref={scrollRef} className='sayoSummaryModal__scroll' aria-live='polite'>
          {searchBody}
          {summaryBody}
        </div>
        {isSummary && (
          <footer className='sayoSummaryModal__foot'>
            {modal.search && (
              <button type='button' className='sayoSummaryModal__back' onClick={sayo.backToSearch}>← <span className='sayoSummaryModal__pcOnly'>{t(messages, ['backToResults'], locale)}</span></button>
            )}
            <button type='button' className='sayoSummaryModal__nav' onClick={() => sayo.step(-1)} disabled={modal.index <= 0} aria-label={t(messages, ['prev'], locale)}>
              ←<span className='sayoSummaryModal__pcOnly'> {t(messages, ['prev'], locale)}</span>
            </button>
            <button type='button' className='sayoSummaryModal__nav' onClick={() => sayo.step(1)} disabled={modal.index >= modal.ids.length - 1} aria-label={t(messages, ['next'], locale)}>
              <span className='sayoSummaryModal__pcOnly'>{t(messages, ['next'], locale)} </span>→
            </button>
            {article && (
              <Link className='sayoSummaryModal__read' href={article.href} locale={linkLocaleForHref(article.href)}>{t(messages, ['read'], locale)}</Link>
            )}
          </footer>
        )}
        <p className='sayoSummaryModal__note'>{t(messages, ['note'], locale)}</p>
      </section>
    </div>
  );
};
