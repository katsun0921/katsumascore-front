import Link from 'next/link';
import { type VodService, VOD_INITIAL, VOD_COLOR_VAR } from '@/libs/vod';
export type VodFinderItem = {
  vod: VodService;
  label: string;
  count?: number;
  href: string;
};

export type HomeVodFinderProps = {
  title: string;
  workCountSuffix: string;
  items: VodFinderItem[];
};

export const HomeVodFinder = ({ title, workCountSuffix, items }: HomeVodFinderProps) => {
  return (
    <section className='homeVodFinder'>
      <h2 className='homeVodFinder__title'>{title}</h2>
      <ul className='homeVodFinder__grid'>
        {items.map(({ vod, label, count, href }) => (
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
                <span className='homeVodItem__name'>{label}</span>
                {count !== undefined && (
                  <span className='homeVodItem__count'>
                    {count}
                    {workCountSuffix}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
