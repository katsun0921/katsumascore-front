import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

/** まとめページ内の見出し分けに使う区分。 */
export type SeasonalEntryCategory = 'anime' | 'drama' | 'movie';

/** まとめページに並ぶ作品1件分（表示用）。 */
export type SeasonalEntryItem = {
  postId: number;
  title: string;
  memo: string;
  /** 個別作品記事へのパス。解決できなければ null（リンクにしない） */
  href: string | null;
};

export type SeasonalEntryListProps = {
  category: SeasonalEntryCategory;
  items: SeasonalEntryItem[];
};

/**
 * 季節まとめの収録作品リスト。区分（アニメ／ドラマ／映画）ごとに1つ描画する。
 * 各作品は個別記事へのリンクと一口メモを持つ。
 */
export const SeasonalEntryList = ({ category, items }: SeasonalEntryListProps) => {
  const locale = useLocale();

  if (items.length === 0) return null;

  return (
    <section data-component='SeasonalEntryList' className='mb-8'>
      <h2 className='text-xl font-bold mb-4 text-color-primary'>
        {t(messages, ['category', category], locale)}
      </h2>
      <ul className='grid list-none grid-cols-1 gap-4 p-0 m-0'>
        {items.map((item) => (
          <li key={item.postId} className='border-b border-color-border pb-4 last:border-b-0'>
            {item.href ? (
              <Link href={item.href} className='text-base font-bold text-color-link hover:underline'>
                {item.title}
              </Link>
            ) : (
              <span className='text-base font-bold text-color-primary'>{item.title}</span>
            )}
            {item.memo ? <p className='mt-1 text-sm text-color-secondary'>{item.memo}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
};
