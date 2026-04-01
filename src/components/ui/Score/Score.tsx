import React from 'react'

export type TScoreProps = {
  score: '1' | '2' | '3' | '4' | '5'
  size?: 'small' | 'medium' | 'large'
}

export const Score = ({ score, size = 'medium' }: TScoreProps) => {
  return (
    <div className={['c-score', `c-score__${size}`].join(' ')}>
      <span className='c-score__count'>{score}</span>
    </div>
  )
}
