import type { Meta, StoryObj } from '@storybook/react'
import { ReviewSiteScores } from './ReviewSiteScores'

const mockSites = [
  { label: 'Filmarks', score: 4.1, maxScore: 5, url: 'https://filmarks.com' },
  { label: 'IMDb', score: 8.7, maxScore: 10, url: 'https://imdb.com' },
  {
    label: 'Rotten Tomatoes',
    score: 97,
    maxScore: 100,
    url: 'https://rottentomatoes.com',
    audienceScore: 98,
  },
  { label: '映画.com', score: 4.2, maxScore: 5, url: 'https://eiga.com' },
  { label: 'Yahoo!映画', score: 4.0, maxScore: 5, url: 'https://movies.yahoo.co.jp' },
]

const meta: Meta<typeof ReviewSiteScores> = {
  title: 'features/ArticleBlock/ReviewSiteScores',
  component: ReviewSiteScores,
  tags: ['autodocs'],
  args: {
    sites: mockSites,
    locale: 'ja',
    publishedDate: '2024年3月15日',
  },
}
export default meta

type Story = StoryObj<typeof ReviewSiteScores>

export const Japanese: Story = { args: { locale: 'ja' } }

export const English: Story = {
  args: {
    sites: mockSites,
    locale: 'en',
    publishedDate: 'March 15, 2024',
  },
}

export const PartialScores: Story = {
  args: {
    sites: [
      { label: 'Filmarks', score: 4.3, maxScore: 5 },
      { label: 'IMDb', score: 0, maxScore: 10 },
    ],
    locale: 'ja',
  },
}
