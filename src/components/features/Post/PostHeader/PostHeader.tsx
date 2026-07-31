import Link from 'next/link';
import { ScoreWithRank } from '@/components/features/ScoreWithRank';
import { SCORE_DISPLAY_MAX } from '@/libs/scoreDisplay';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { TStudioEntry } from '@/components/features/Post/PostTitleMeta';
export type PostHeaderProps = {
  category: string
  titleOfficial: string
  titleOriginal?: string
  filmStudios?: TStudioEntry[]
  productionStudios?: TStudioEntry[]
  releaseDate?: string  // 'YYYYMMDD'
  copyright?: string
  // PostHeroScore から移動
  score?: number
  scoreMax?: number
  comment?: string
}

export const PostHeader = ({
  titleOfficial,
  titleOriginal,
  filmStudios,
  productionStudios,
  releaseDate,
  copyright,
  score,
  scoreMax = SCORE_DISPLAY_MAX,
  comment,
}: PostHeaderProps) => {
  const locale = useLocale();
  const sep = t(messages, ['meta', 'sep'], locale);
  const studioSep = ' / ';

  const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : undefined;
  const prefix = 'post-header';

  const renderStudios = (studios: TStudioEntry[]) => (
    <>
      {studios.map((studio, i) => (
        <span key={studio.href ?? studio.name}>
          {i > 0 && studioSep}
          {studio.href ? (
            <Link href={studio.href} className={`${prefix}__meta-link`}>
              {studio.name}
            </Link>
          ) : (
            studio.name
          )}
        </span>
      ))}
    </>
  );

  const metaParts = [
    filmStudios && filmStudios.length > 0 ? renderStudios(filmStudios) : undefined,
    productionStudios && productionStudios.length > 0 ? renderStudios(productionStudios) : undefined,
    year,
  ].filter(Boolean);
  return (
    <div data-component='PostHeader' className={prefix}>
      <hgroup className={`${prefix}__hgroup`}>
        {comment && <p className={`${prefix}__tagline`}>{comment}</p>}
        <h1 className={`${prefix}__title-main`}>{titleOfficial}</h1>
      </hgroup>
      <div className={`${prefix}__lower`}>
        <div className={`${prefix}__meta-group`}>
          {titleOriginal && <p className={`${prefix}__title-original`}>{titleOriginal}</p>}
          {metaParts.length > 0 && (
            <p className={`${prefix}__meta`}>
              {metaParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className={`${prefix}__meta-sep`}>{sep}</span>}
                  {part}
                </span>
              ))}
            </p>
          )}
          {copyright && <p className={`${prefix}__copyright`}>{copyright}</p>}
        </div>
        {score !== undefined && (
          <div className={`${prefix}__rank`}>
            <ScoreWithRank value={score} max={scoreMax} />
          </div>
        )}
      </div>
    </div>
  );
};
