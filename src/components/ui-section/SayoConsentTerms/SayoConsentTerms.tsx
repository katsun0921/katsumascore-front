import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

/** 規約の項目の並び（表示順） */
const POINTS = ['ai', 'send', 'keep', 'limit', 'spoiler', 'beta', 'browser'] as const;

export type SayoConsentTermsProps = {
  className?: string;
};

/**
 * サヨの利用規約の項目（番号つきの一覧）。
 * 折りたたみ（<details>）やスクロールの枠は持たず、同意画面の側（SayoConsentModal／SayoConsentDialog）が包む
 */
export const SayoConsentTerms = ({ className }: SayoConsentTermsProps) => {
  const locale = useLocale();
  return (
    <ol data-component='SayoConsentTerms' className={['sayoConsentTerms', className].filter(Boolean).join(' ')}>
      {POINTS.map((key) => (
        <li key={key} className='sayoConsentTerms__item'>
          <h3 className='sayoConsentTerms__title'>{t(messages, ['points', key, 'title'], locale)}</h3>
          <p className='sayoConsentTerms__body'>{t(messages, ['points', key, 'body'], locale)}</p>
        </li>
      ))}
    </ol>
  );
};
