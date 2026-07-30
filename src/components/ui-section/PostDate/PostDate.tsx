import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { formatDate } from '@/utils/formatDate';
import { messages } from './i18n';

export type TDateProps = {
  publishedAt: string
  updatedAt?: string
}

export const PostDate = ({ publishedAt, updatedAt }: TDateProps) => {
  const locale = useLocale();
  const published = formatDate(publishedAt, locale);
  const updated = updatedAt ? formatDate(updatedAt, locale) : null;

  return (
    <div data-component='PostDate' className='flex flex-col gap-1 text-[var(--font-size-ui-sm)] text-color-secondary'>
      {updated && (
        <p>
          <time className='inline-block' dateTime={updated.datetime}>
            {`${t(messages, ['label', 'updatedAt'], locale)}: ${updated.display}`}
          </time>
        </p>
      )}
      <p>
        <time className='inline-block' dateTime={published.datetime}>
          {`${t(messages, ['label', 'publishedAt'], locale)}: ${published.display}`}
        </time>
      </p>
    </div>
  );
};
