import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import ProfileImg from '@assets/images/profile.webp';
import { XIcon } from '@/assets/icons';

export type ProfileProps = {
  name: string
  comment?: string
  avatarUrl?: string
  aboutUrl: string
  social?: {
    x?: string
  }
}

export const Profile = ({
  comment,
}: ProfileProps) => {
  const locale = useLocale();
  const description = t(messages, ['description'], locale);

  return (
    <div className='p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg'>
      {/* アバター */}
      <div className='flex items-center gap-3 mb-3'>
        <Image
          src={ProfileImg}
          alt={t(messages, ['avatar', 'alt'], locale)}
          width={72}
          height={72}
          className='rounded-full flex-shrink-0 object-cover'
        />
      </div>

      {/* 説明文 */}
      {description && (
        <p className='text-[length:var(--font-size-body)] leading-[1.7] text-[var(--color-text-secondary)] mb-3'>
          {description}
        </p>
      )}

      {/* 管理者の一言コメント */}
      {comment && (
        <div className='mb-3'>
          <span className='block relative text-[length:var(--font-size-ui)] leading-[1.65] text-[var(--color-text-primary)] bg-[var(--color-surface)] rounded-[0_8px_8px_8px] p-3 before:content-[""] before:absolute before:top-0 before:-left-2 before:border-[0_8px_8px_0] before:border-solid before:border-[transparent_var(--color-surface)_transparent_transparent]'>
            {comment}
          </span>
        </div>
      )}

      {/* SNSリンク */}
      <div className='flex gap-2 mb-3'>
        <Link
          href="https://x.com/Katsun0921"
          target='_blank'
          rel='noreferrer'
          className='flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-x)] text-[var(--color-text-inverse)] transition-[opacity,transform] duration-200 ease hover:opacity-80 hover:scale-110'
          aria-label='X (Twitter)'
        >
          <XIcon width='16' height='16' aria-hidden='true' />
        </Link>
      </div>
      <div>
        <Link
          href="/about"
          className='text-[length:var(--font-size-ui)] text-[var(--color-primary)] hover:underline'
        >
          {t(messages, ['about', 'link'], locale)}
        </Link>
      </div>
    </div>
  );
};
