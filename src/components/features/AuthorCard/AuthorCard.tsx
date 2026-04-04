import React from 'react'
import './AuthorCard.scss'

export type TAuthorCardProps = {
  name: string
  avatarUrl?: string
  profileUrl?: string
  bio?: string
  headline?: string
  socials?: {
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
    website?: string
  }
}

export const AuthorCard = ({
  name,
  avatarUrl,
  profileUrl,
  bio,
  headline,
  socials = {},
}: TAuthorCardProps) => {
  return (
    <div className='p-author-card'>
      <div className='p-author-card__top'>
        {avatarUrl && (
          <a className='p-author-card__avatar-link' href={profileUrl || '#'}>
            <img className='p-author-card__avatar' src={avatarUrl} alt={name} width={80} height={80} />
          </a>
        )}
        <div className='p-author-card__info'>
          <h5 className='p-author-card__name'>
            {profileUrl ? <a href={profileUrl}>{name}</a> : name}
          </h5>
          {headline && <p className='p-author-card__headline'>{headline}</p>}
        </div>
      </div>
      {bio && <p className='p-author-card__bio'>{bio}</p>}
      {Object.values(socials).some(Boolean) && (
        <ul className='p-author-card__socials'>
          {socials.website && (
            <li>
              <a href={socials.website} target='_blank' rel='noopener noreferrer' className='p-author-card__social-link'>
                Website
              </a>
            </li>
          )}
          {socials.twitter && (
            <li>
              <a href={socials.twitter} target='_blank' rel='noopener noreferrer' className='p-author-card__social-link p-author-card__social-link--twitter'>
                X
              </a>
            </li>
          )}
          {socials.facebook && (
            <li>
              <a href={socials.facebook} target='_blank' rel='noopener noreferrer' className='p-author-card__social-link p-author-card__social-link--facebook'>
                Facebook
              </a>
            </li>
          )}
          {socials.instagram && (
            <li>
              <a href={socials.instagram} target='_blank' rel='noopener noreferrer' className='p-author-card__social-link p-author-card__social-link--instagram'>
                Instagram
              </a>
            </li>
          )}
          {socials.youtube && (
            <li>
              <a href={socials.youtube} target='_blank' rel='noopener noreferrer' className='p-author-card__social-link p-author-card__social-link--youtube'>
                YouTube
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
