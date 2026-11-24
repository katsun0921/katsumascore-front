import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

/** 規約の項目の並び（表示順） */
const POINTS = ['ai', 'send', 'keep', 'limit', 'spoiler', 'beta', 'browser'] as const;

export type SayoConsentTermsProps = {
  /** 最初から開いておくか（既定は閉じる） */
  defaultOpen?: boolean;
  className?: string;
};

/**
 * サヨの利用規約の本文。<details> で折りたたみ、「利用規約を読む」で開く。
 * 同意のチェックボックスは持たない（SayoConsentModal が持つ）
 */
export const SayoConsentTerms = ({ defaultOpen = false, className }: SayoConsentTermsProps) => {
  const locale = useLocale();
  return (
    <div data-component='SayoConsentTerms' className={['sayoConsentTerms', className].filter(Boolean).join(' ')}>
      <p className='sayoConsentTerms__lead'>{t(messages, ['lead'], locale)}</p>
      <details className='sayoConsentTerms__details' open={defaultOpen}>
        <summary className='sayoConsentTerms__summary'>{t(messages, ['summary'], locale)}</summary>
        <ol className='sayoConsentTerms__list'>
          {POINTS.map((key) => (
            <li key={key} className='sayoConsentTerms__item'>
              <h3 className='sayoConsentTerms__title'>{t(messages, ['points', key, 'title'], locale)}</h3>
              <p className='sayoConsentTerms__body'>{t(messages, ['points', key, 'body'], locale)}</p>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
};
