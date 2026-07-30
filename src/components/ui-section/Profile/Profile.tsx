import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import ProfileImg from '@assets/images/profile.webp';
import { XIcon } from '@/assets/icons';
import { profileConfig } from './Profile.config';

export type ProfileProps = {
  /** 投稿の抜粋（WP excerpt） */
  excerpt?: string
  comment?: string
}

export const Profile = ({
  excerpt,
}: ProfileProps) => {
  const locale = useLocale();
  const description = t(messages, ['description'], locale);

  return (
    <div data-component='Profile' className='p-5 bg-color-bg border border-color-border rounded-lg flex flex-col gap-5'>
      <div className='flex items-center gap-3'>
        <Image
          src={ProfileImg}
          alt={t(messages, ['avatar', 'alt'], locale)}
          width={72}
          height={72}
          className='rounded-full flex-shrink-0 object-cover ring-2 ring-color-border'
        />

        <div className='flex flex-col'>
          <p className='text-ui font-medium text-color-primary'>
            {profileConfig.admin}
          </p>
        </div>
      </div>

      {excerpt && (
        <div className='border-t border-b border-color-border py-3'>
          <span className='block text-ui text-color-secondary mb-1'>
            {t(messages, ['excerpt', 'label'], locale)}
          </span>
          <p className='italic text-body text-color-secondary leading-relaxed '>{excerpt}</p>
        </div>
      )}

      {description && (
        <p className='text-body text-color-secondary leading-relaxed'>
          {description}
        </p>
      )}
      <Link
        href={profileConfig.aboutUrl}
        className='inline-block bg-primary text-color-inverse text-ui font-medium px-4 py-2.5 rounded-md text-center transition hover:opacity-90'
        aria-label='スコアの仕組みを見る'
      >
        {t(messages, ['about', 'link'], locale)}
      </Link>

        <div className='flex items-center gap-2'>
          <span className='text-ui text-color-secondary tracking-wide'>
            Follow Me
          </span>
          <Link
            href={profileConfig.social.x}
            target='_blank'
            rel='noreferrer'
            className='flex items-center justify-center w-8 h-8 rounded-full bg-x text-color-inverse transition-[opacity,transform] duration-200 ease hover:opacity-80 hover:scale-110'
            aria-label='X (Twitter)'
          >
            <XIcon width='16' height='16' aria-hidden='true' />
          </Link>
        </div>
    </div>
  );
};
