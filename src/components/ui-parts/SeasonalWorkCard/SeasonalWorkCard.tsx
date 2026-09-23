import type { SeasonalWorkVod } from '@/libs/seasonalWorks';

export type TSeasonalWorkCardProps = {
  title: string;
  summary: string;
  /** 公式サイト等へのリンク。無ければタイトルをリンクにしない */
  officialUrl: string | null;
  vods: SeasonalWorkVod[];
  /** 検索語に一致した箇所を強調するためのキーワード。空なら強調しない */
  highlight?: string;
  /** 公式サイトリンクのラベル（i18n 済みの文言を受け取る） */
  officialLabel: string;
};

/**
 * 検索語に一致した部分を `<mark>` で囲んだ断片へ分解する。
 * 正規表現の特殊文字は打ち消し、入力がそのまま検索語として使えるようにする。
 */
const splitByKeyword = (text: string, keyword: string): { value: string; hit: boolean }[] => {
  if (keyword.length === 0) return [{ value: text, hit: false }];
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({ value: part, hit: part.toLowerCase() === keyword.toLowerCase() }));
};

/** 検索語に一致した箇所だけ `<mark>` を当てて描画する。 */
const Highlighted = ({ text, keyword }: { text: string; keyword: string }) => (
  <>
    {splitByKeyword(text, keyword).map((part, index) =>
      part.hit ? (
        <mark
          key={`${part.value}-${index}`}
          className='rounded-[2px] bg-[var(--color-highlight-mark)] px-1 text-[var(--color-text-primary)]'
        >
          {part.value}
        </mark>
      ) : (
        <span key={`${part.value}-${index}`}>{part.value}</span>
      ),
    )}
  </>
);

/**
 * 季節まとめ一覧に並ぶ作品カード1枚。
 * タイトル・あらすじ・配信サービスを1枚に収め、一覧のまま比較できるようにする。
 */
export const SeasonalWorkCard = ({
  title,
  summary,
  officialUrl,
  vods,
  highlight = '',
  officialLabel,
}: TSeasonalWorkCardProps) => {
  return (
    <article
      data-component='SeasonalWorkCard'
      className='flex h-full flex-col gap-3 rounded-[8px] border border-color-border-muted bg-[var(--color-bg)] p-4 transition-[border-color,box-shadow] duration-200 ease-[ease] hover:border-[var(--color-primary)] hover:shadow-[0_2px_12px_var(--color-border-soft)]'
    >
      <h3 className='m-0 text-[length:var(--font-size-body)] font-bold leading-[1.5] text-[var(--color-text-primary)]'>
        <Highlighted text={title} keyword={highlight} />
      </h3>

      {summary ? (
        <p className='m-0 text-[length:var(--font-size-ui)] leading-[1.7] text-[var(--color-text-secondary)]'>
          <Highlighted text={summary} keyword={highlight} />
        </p>
      ) : null}

      {vods.length > 0 ? (
        <ul className='m-0 mt-auto flex list-none flex-wrap gap-2 p-0'>
          {vods.map((vod) => (
            <li
              key={vod.label}
              className='inline-flex items-center gap-1 rounded-[3px] border border-color-border-muted px-2 py-1 text-[length:var(--font-size-caption)] leading-[1.4] text-[var(--color-text-muted)]'
            >
              {vod.colorVar ? (
                <span
                  aria-hidden='true'
                  className='inline-block h-2 w-2 rounded-full'
                  style={{ backgroundColor: vod.colorVar }}
                />
              ) : null}
              {vod.label}
            </li>
          ))}
        </ul>
      ) : null}

      {officialUrl ? (
        <a
          href={officialUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-[length:var(--font-size-caption)] text-[var(--color-primary)] underline-offset-2 hover:underline'
        >
          {officialLabel}
        </a>
      ) : null}
    </article>
  );
};
