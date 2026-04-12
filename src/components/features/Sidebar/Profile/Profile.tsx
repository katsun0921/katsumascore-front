import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/i18n/provider'
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
    instagram?: string
  }
}

export const Profile = ({
  name,
  description,
  comment,
  avatarUrl,
  aboutUrl,
  social,
}: ProfileProps) => {
  const locale = useLocale()

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
      {social && (social.x || social.instagram) && (
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
          {social.instagram && (
            <a
              href={social.instagram}
              target='_blank'
              rel='noreferrer'
              className='sidebar-profile__social-link sidebar-profile__social-link--instagram'
              aria-label='Instagram'
            >
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' />
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
