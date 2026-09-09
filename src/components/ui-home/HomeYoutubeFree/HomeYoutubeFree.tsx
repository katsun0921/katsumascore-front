import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { ScoreHexBadge } from '@/components/ui-parts/ScoreHexBadge';
import type { HomeYoutubeFreeProps, YoutubeFreeItem } from './HomeYoutubeFree.types';

/**
 * 1作品分のカード。記事リンクと YouTube リンクは並列に置く
 * （`<a>` の入れ子は不正な HTML になるため、カード全体をリンクにはしない）。
 */
const YoutubeFreeCard = ({
  item,
  newLabel,
  watchLabel,
  startedAtSuffix,
}: {
  item: YoutubeFreeItem;
  newLabel: string;
  watchLabel: string;
  startedAtSuffix: string;
}) => (
  <li className='homeYoutubeFree__item'>
    <Link
      href={item.href}
      locale={linkLocaleForHref(item.href)}
      className='homeYoutubeFree__card'
    >
      <PostCardMedia
        image={item.image}
        title={item.title}
        className='homeYoutubeFree__media'
        sizes='160px'
      >
        {item.score !== undefined && (
          <ScoreHexBadge score={item.score} className='homeYoutubeFree__score' />
        )}
        {item.isNew && <span className='homeYoutubeFree__new'>{newLabel}</span>}
      </PostCardMedia>
      <p className='homeYoutubeFree__cardTitle'>{item.title}</p>
    </Link>

    {item.channelName !== undefined && (
      <p className='homeYoutubeFree__channel'>{item.channelName}</p>
    )}

    {item.startedAtLabel !== undefined && (
      <p className='homeYoutubeFree__period'>
        {item.startedAtLabel}
        {startedAtSuffix}
      </p>
    )}

    {item.youtubeUrl !== undefined && (
      <a
        href={item.youtubeUrl}
        className='homeYoutubeFree__watch'
        target='_blank'
        rel='noopener noreferrer'
      >
        {watchLabel}
      </a>
    )}
  </li>
);

/**
 * TOP の「YouTube で無料配信中」セクション。
 *
 * 他の横スクロール枠（`HomeCardScrollList`）と意図的に見た目を変えている。
 * 掲載作品は配給会社の公式チャンネルによる**期間限定の無料公開**で、
 * 数日で終わることがあるため「無料である」ことと「期間限定である」ことを
 * カードの外に明示する必要がある。
 */
export const HomeYoutubeFree = ({
  title,
  freeLabel,
  note,
  newLabel,
  watchLabel,
  startedAtSuffix,
  items,
}: HomeYoutubeFreeProps) => {
  if (items.length === 0) return null;

  return (
    <section data-component='HomeYoutubeFree' className='homeYoutubeFree'>
      <div className='homeYoutubeFree__header'>
        <div className='homeYoutubeFree__titleRow'>
          <span className='homeYoutubeFree__freeBadge'>{freeLabel}</span>
          <h2 className='homeYoutubeFree__title'>{title}</h2>
        </div>
        <p className='homeYoutubeFree__note'>{note}</p>
      </div>

      <ul className='homeYoutubeFree__track'>
        {items.map((item) => (
          <YoutubeFreeCard
            key={item.id}
            item={item}
            newLabel={newLabel}
            watchLabel={watchLabel}
            startedAtSuffix={startedAtSuffix}
          />
        ))}
      </ul>
    </section>
  );
};
