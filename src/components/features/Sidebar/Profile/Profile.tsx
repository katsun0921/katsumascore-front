import Image from 'next/image'
import Link from 'next/link'
import { type Locale } from '@/i18n/t'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './Profile.scss'

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
    <div className='sidebar-profile'>
      {/* アバター + 名前 */}
      <div className='sidebar-profile__header'>
        <Image
          src={avatarUrl}
          alt={t(messages, ['avatar', 'alt'], locale)}
          width={72}
          height={72}
          className='sidebar-profile__avatar'
        />
        <p className='sidebar-profile__name'>{name}</p>
      </div>

      {/* 説明文 */}
      <p className='sidebar-profile__description'>{description}</p>

      {/* 管理者の一言コメント */}
      {comment && (
        <div className='sidebar-profile__comment'>
          <span className='sidebar-profile__comment-bubble'>{comment}</span>
        </div>
      )}

      {/* SNSリンク */}
      {social && (social.x) && (
        <div className='sidebar-profile__social'>
          {social.x && (
            <a
              href={social.x}
              target='_blank'
              rel='noreferrer'
              className='sidebar-profile__social-link sidebar-profile__social-link--x'
              aria-label='X (Twitter)'
            >
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* プロフィールリンク */}
      <Link href={aboutUrl} className='sidebar-profile__about-link'>
        {t(messages, ['about', 'link'], locale)}
        <span aria-hidden='true'> →</span>
      </Link>
    </div>
  )
}
