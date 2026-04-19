import Image from 'next/image'
import Link from 'next/link'
import { type Locale } from '@/i18n/t'
import { t } from '@/i18n/t'
import { messages } from './i18n'

export type ProfileProps = {
  name: string
  description: string
  comment?: string
  avatarUrl: string
  aboutUrl: string
  social?: {
    x?: string
  }
  locale: Locale
}

export const Profile = ({
  name,
  description,
  comment,
  avatarUrl,
  aboutUrl,
  social,
  locale,
}: ProfileProps) => {
  return (
    <div className='p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg'>
      {/* アバター + 名前 */}
      <div className='flex items-center gap-3 mb-3'>
        <Image
          src={avatarUrl}
          alt={t(messages, ['avatar', 'alt'], locale)}
          width={72}
          height={72}
          className='rounded-full flex-shrink-0 object-cover'
        />
        <p className='text-[length:var(--font-size-ui)] font-bold tracking-[0.05em] text-[var(--color-text-primary)]'>
          {name}
        </p>
      </div>

      {/* 説明文 */}
      <p className='text-[length:var(--font-size-caption)] leading-[1.7] text-[var(--color-text-secondary)] mb-3'>
        {description}
      </p>

      {/* 管理者の一言コメント */}
      {comment && (
        <div className='mb-3'>
          <span className='block relative text-[length:var(--font-size-caption)] leading-[1.65] text-[var(--color-text-body)] bg-[var(--color-surface-muted)] rounded-[0_8px_8px_8px] p-3 before:content-[""] before:absolute before:top-0 before:-left-2 before:border-[0_8px_8px_0] before:border-solid before:border-[transparent_var(--color-surface-muted)_transparent_transparent]'>
            {comment}
          </span>
        </div>
      )}

      {/* SNSリンク */}
      {social?.x && (
        <div className='flex gap-2 mb-3'>
          <Link
            href={social.x}
            target='_blank'
            rel='noreferrer'
            className='flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-x)] text-[var(--color-text-inverse)] transition-[opacity,transform] duration-200 ease hover:opacity-80 hover:scale-110'
            aria-label='X (Twitter)'
          >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true' className='w-4 h-4 fill-current'>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </svg>
          </Link>
        </div>
      )}

      {/* プロフィールリンク */}
      <Link
        href={aboutUrl}
        className='inline-block text-[length:var(--font-size-caption)] text-[var(--color-primary)] no-underline transition-opacity duration-200 ease hover:opacity-70'
      >
        {t(messages, ['about', 'link'], locale)}
        <span aria-hidden='true'> →</span>
      </Link>
    </div>
  )
}
