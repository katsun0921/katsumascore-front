import Image from 'next/image'
import Link from 'next/link'
import { type Locale } from '@/i18n/t'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import ProfileImg from '@assets/images/profile.webp'
import IconX from '@assets/icons/x.svg'

export type ProfileProps = {
  name: string
  description: string
  comment?: string
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
  aboutUrl,
  locale,
}: ProfileProps) => {
  return (
    <div className='p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg'>
      {/* アバター + 名前 */}
      <div className='flex items-center gap-3 mb-3'>
        <Image
          src={ProfileImg}
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
          <span className='block relative text-[length:var(--font-size-caption)] leading-[1.65] text-[var(--color-text-primary)] bg-[var(--color-surface)] rounded-[0_8px_8px_8px] p-3 before:content-[""] before:absolute before:top-0 before:-left-2 before:border-[0_8px_8px_0] before:border-solid before:border-[transparent_var(--color-surface)_transparent_transparent]'>
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
          <Image
            src={IconX}
            alt="X (Twitter) Katsun0921"
            width={72}
            height={72}
            className='w-4 h-4 fill-current'
          />
        </Link>
      </div>
    </div>
  )
}
