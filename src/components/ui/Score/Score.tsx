import React from 'react'

export type TScoreProps = {
  score: '1' | '2' | '3' | '4' | '5'
  size?: 'small' | 'medium' | 'large'
}

export const Score = ({ score }: TScoreProps) => {
  return (
    <div>
      <span>{score}</span>
    </div>
  )
}
