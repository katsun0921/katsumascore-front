import React from 'react'
import './Score.scss'

export type TScoreProps = {
  score: '1' | '2' | '3' | '4' | '5'
  size?: 'small' | 'medium' | 'large'
}

export const Score = ({ score, size = 'medium' }: TScoreProps) => {
  return (
    <div className={['score', `score__${size}`].join(' ')}>
      <span className='score__count'>{score}</span>
    </div>
  )
}
