import { useId, useMemo, useState } from 'react';
import { SeasonalWorkCard } from '@/components/ui-parts/SeasonalWorkCard';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { collectVodFilters, type SeasonalWork } from '@/libs/seasonalWorks';
import { messages } from './i18n';

export type TSeasonalWorkExplorerProps = {
  works: SeasonalWork[];
};

/** 検索語・配信サービスの両方に一致する作品だけを残す。 */
const filterWorks = (works: SeasonalWork[], keyword: string, vod: string | null): SeasonalWork[] => {
  const needle = keyword.trim().toLowerCase();
  return works.filter((work) => {
    if (vod && !work.vods.some((v) => v.key === vod)) return false;
    if (needle.length === 0) return true;
    return (
      work.title.toLowerCase().includes(needle) || work.summary.toLowerCase().includes(needle)
    );
  });
};

/**
 * 季節まとめの作品一覧を、検索・配信サービス絞り込み・インデックス付きで表示する。
 *
 * 作品数が数十件あるまとめページでは、単純な縦並びだと目的の作品に辿り着けない。
 * 入力による絞り込みをクライアント側で完結させ、ページ遷移なしで候補を狭められるようにする。
 */
export const SeasonalWorkExplorer = ({ works }: TSeasonalWorkExplorerProps) => {
  const locale = useLocale();
  const searchId = useId();
  const indexId = useId();

  const [keyword, setKeyword] = useState('');
  const [vod, setVod] = useState<string | null>(null);
  const [isIndexOpen, setIsIndexOpen] = useState(false);

  const vodFilters = useMemo(() => collectVodFilters(works), [works]);
  const visible = useMemo(() => filterWorks(works, keyword, vod), [works, keyword, vod]);

  const isFiltered = keyword.trim().length > 0 || vod !== null;
  const resetAll = () => {
    setKeyword('');
    setVod(null);
  };

  const countLabel = t(messages, ['result', 'count'], locale)
    .replace('{shown}', String(visible.length))
    .replace('{total}', String(works.length));

  return (
    <div data-component='SeasonalWorkExplorer' className='seasonalWorkExplorer'>
      <div className='seasonalWorkExplorer__controls'>
        <div className='seasonalWorkExplorer__searchField'>
          <label className='seasonalWorkExplorer__label' htmlFor={searchId}>
            {t(messages, ['search', 'label'], locale)}
          </label>
          <div className='seasonalWorkExplorer__searchInputWrap'>
            <input
              id={searchId}
              type='search'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t(messages, ['search', 'placeholder'], locale)}
              className='seasonalWorkExplorer__input'
              autoComplete='off'
            />
          </div>
        </div>

        {vodFilters.length > 0 && (
          <div className='seasonalWorkExplorer__vodField'>
            <p className='seasonalWorkExplorer__label'>{t(messages, ['vod', 'label'], locale)}</p>
            <ul className='seasonalWorkExplorer__vodList'>
              <li>
                <button
                  type='button'
                  aria-pressed={vod === null}
                  onClick={() => setVod(null)}
                  className='seasonalWorkExplorer__chip'
                >
                  {t(messages, ['vod', 'all'], locale)}
                </button>
              </li>
              {vodFilters.map((filter) => (
                <li key={filter.key}>
                  <button
                    type='button'
                    aria-pressed={vod === filter.key}
                    onClick={() => setVod(vod === filter.key ? null : filter.key)}
                    className='seasonalWorkExplorer__chip'
                  >
                    {filter.key}
                    <span className='seasonalWorkExplorer__chipCount'>{filter.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='seasonalWorkExplorer__status'>
        <p className='seasonalWorkExplorer__count'>{countLabel}</p>
        {isFiltered && (
          <button type='button' onClick={resetAll} className='seasonalWorkExplorer__reset'>
            {t(messages, ['result', 'reset'], locale)}
          </button>
        )}
      </div>

      {/* 索引: 全タイトルへのアンカー。絞り込み結果に追従させ、今見えている作品だけを並べる */}
      {visible.length > 0 && (
        <div className='seasonalWorkExplorer__index'>
          <button
            type='button'
            className='seasonalWorkExplorer__indexToggle'
            aria-expanded={isIndexOpen}
            aria-controls={indexId}
            onClick={() => setIsIndexOpen((prev) => !prev)}
          >
            {t(messages, ['index', 'title'], locale)}
          </button>
          {isIndexOpen && (
            <ul id={indexId} className='seasonalWorkExplorer__indexList'>
              {visible.map((work) => (
                <li key={work.id}>
                  <a href={`#${work.id}`} className='seasonalWorkExplorer__indexLink'>
                    {work.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <p className='seasonalWorkExplorer__empty'>{t(messages, ['result', 'empty'], locale)}</p>
      ) : (
        <ul className='seasonalWorkExplorer__grid'>
          {visible.map((work) => (
            <li key={work.id} id={work.id} className='seasonalWorkExplorer__gridItem'>
              <SeasonalWorkCard
                title={work.title}
                summary={work.summary}
                officialUrl={work.officialUrl}
                vods={work.vods}
                highlight={keyword.trim()}
                officialLabel={t(messages, ['card', 'official'], locale)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
