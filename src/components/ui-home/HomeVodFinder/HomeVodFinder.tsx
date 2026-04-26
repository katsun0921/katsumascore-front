import Link from 'next/link';
import { type VodService, VOD_LABEL, VOD_INITIAL, VOD_COLOR_VAR } from '@/lib/vod';
export type VodFinderItem = {
  vod: VodService;
  count?: number;
  href: string;
};

export type HomeVodFinderProps = {
  items: VodFinderItem[];
};

export const HomeVodFinder = ({ items }: HomeVodFinderProps) => {
  return (
    <section className='homeVodFinder'>
      <h2 className='homeVodFinder__title'>VODで探す</h2>
      <ul className='homeVodFinder__grid'>
        {items.map(({ vod, count, href }) => (
          <li key={vod}>
            <Link href={href} className='homeVodItem'>
              <span
                className='homeVodItem__icon'
                style={{ background: VOD_COLOR_VAR[vod] }}
                aria-hidden='true'
              >
                {VOD_INITIAL[vod]}
              </span>
              <span className='homeVodItem__info'>
                <span className='homeVodItem__name'>{VOD_LABEL[vod]}</span>
                {count !== undefined && (
                  <span className='homeVodItem__count'>{count}作品</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
