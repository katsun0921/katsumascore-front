import Image from 'next/image'
import './PostHeroSummary.scss'

export type PostHeroSummaryProps = {
  posterUrl: string
  description: string
}

export function PostHeroSummary({ posterUrl, description }: PostHeroSummaryProps) {
  return (
    <div className='post-hero-summary'>
      <div className='post-hero-summary__poster'>
        <Image
          src={posterUrl}
          alt=''
          fill
          className='post-hero-summary__poster-img'
        />
      </div>
      <p className='post-hero-summary__description'>{description}</p>
    </div>
  )
}
