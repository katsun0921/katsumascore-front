export type ProfileConfig = {
  admin: string
  description: string
  aboutUrl: string
  social: {
    x: string
  }
}

export const profileConfig: ProfileConfig = {
  admin: '映画レビューサイト「katsumascore」を運営している管理人です。映画への情熱を共有し、あなたに興味があるも提供します！',
  description: '独自スコアでレビューするブログを運営しています。',
  aboutUrl: '/about',
  social: {
    x: 'https://x.com/Katsun0921',
  },
};
