import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReviewSiteScores } from './ReviewSiteScores'
import type { TReviewSite } from './ReviewSiteScores'

const defaultSites: TReviewSite[] = [
  {
    siteId: 'imdb',
    label: 'IMDb',
    score: 7.3,
    summary: 'デンゼルの存在感に高評価。プロットの薄さを指摘する声も',
    url: 'https://www.imdb.com/title/tt0455944/',
  },
  {
    siteId: 'rt-critics',
    label: 'RT 批評家',
    score: 61,
    summary: 'スタイリッシュだが深みに欠けるとの評。演出と演技は高く評価',
    url: 'https://www.rottentomatoes.com/m/the_equalizer_2013',
  },
  {
    siteId: 'rt-audience',
    label: 'RT 観客',
    score: 44,
    summary: '批評家との乖離が大きい。一般興行の反応とも差が見られる',
    url: 'https://www.rottentomatoes.com/m/the_equalizer_2013',
  },
  {
    siteId: 'filmarks',
    label: 'Filmarks',
    score: 3.8,
    summary: '日本での人気が高く、繰り返し鑑賞したいという声が目立つ',
    url: 'https://filmarks.com/movies/56537',
  },
  {
    siteId: 'eiga-com',
    label: '映画.com',
    score: 3.7,
    summary: 'カタルシスを評価する声が多い一方、独り無双の説得力には賛否あり',
    url: 'https://eiga.com/movie/78782/',
  },
]

const meta: Meta<typeof ReviewSiteScores> = {
  title: 'features/ReviewSiteScores',
  component: ReviewSiteScores,
  tags: ['autodocs'],
  args: {
    sites: defaultSites,
    updatedAt: '2026-04-05',
  },
}
export default meta

type Story = StoryObj<typeof ReviewSiteScores>

export const Default: Story = {}

export const HighScores: Story = {
  args: {
    sites: [
      { siteId: 'imdb', score: 9.0, summary: '主演の説得力と完成度の高さが広く支持されている', url: 'https://example.com/imdb' },
      { siteId: 'rt-critics', score: 95, summary: '批評家からも演出と脚本の両面で高い支持を集めている', url: 'https://example.com/rt-critics' },
      { siteId: 'rt-audience', score: 92, summary: '観客満足度も高く、口コミの勢いがそのままスコアに反映されている', url: 'https://example.com/rt-audience' },
      { siteId: 'filmarks', score: 4.5, summary: '鑑賞後の満足感が強く、再鑑賞したいという反応が目立つ', url: 'https://example.com/filmarks' },
      { siteId: 'eiga-com', score: 4.3, summary: '娯楽性と完成度のバランスが良いと安定した支持を得ている', url: 'https://example.com/eiga' },
    ] satisfies TReviewSite[],
  },
}

export const LowScores: Story = {
  args: {
    sites: [
      { siteId: 'imdb', score: 3.2, summary: '主演は健闘しているが、作品全体の弱さを補いきれていない', url: 'https://example.com/imdb' },
      { siteId: 'rt-critics', score: 15, summary: '脚本とテンポの粗さが強く指摘され、評価は伸び悩んでいる', url: 'https://example.com/rt-critics' },
      { siteId: 'rt-audience', score: 18, summary: '観客側でも盛り上がりに欠けるという感想が中心になっている', url: 'https://example.com/rt-audience' },
      { siteId: 'filmarks', score: 1.8, summary: 'アイデアは評価されつつも、満足度にはつながっていない', url: 'https://example.com/filmarks' },
      { siteId: 'eiga-com', score: 1.5, summary: '期待とのギャップが大きく、厳しいレビューが並んでいる', url: 'https://example.com/eiga' },
    ] satisfies TReviewSite[],
  },
}

export const English: Story = {
  args: {
    updatedAt: '2026-04-05',
    sites: [
      { siteId: 'imdb', score: 7.3, summary: 'Washington gets strong praise, though the plot feels thin to some.', url: 'https://example.com/imdb' },
      { siteId: 'rt-critics', score: 61, summary: 'Critics like the style and performance, but not everyone buys the depth.', url: 'https://example.com/rt-critics' },
      { siteId: 'rt-audience', score: 44, summary: 'Audience response is much cooler, showing a clear gap from critics.', url: 'https://example.com/rt-audience' },
      { siteId: 'filmarks', score: 3.8, summary: 'Japanese viewers tend to respond well to its rewatchable appeal.', url: 'https://example.com/filmarks' },
      { siteId: 'eiga-com', score: 3.7, summary: 'The catharsis lands for many viewers, though plausibility divides opinion.', url: 'https://example.com/eiga' },
    ] satisfies TReviewSite[],
  },
  globals: { locale: 'en' },
}

export const WithoutRT: Story = {
  args: {
    sites: [
      { siteId: 'imdb', score: 7.3, summary: '主演の存在感が作品全体をしっかり支えている', url: 'https://example.com/imdb' },
      { siteId: 'filmarks', score: 3.8, summary: '国内では見やすさと満足感を評価する声が多い', url: 'https://example.com/filmarks' },
      { siteId: 'eiga-com', score: 3.7, summary: '娯楽性への支持は強いが、リアリティには意見が分かれる', url: 'https://example.com/eiga' },
    ] satisfies TReviewSite[],
  },
}

export const LongSummary: Story = {
  args: {
    sites: [
      {
        siteId: 'imdb',
        score: 7.3,
        summary:
          '主演の圧倒的な存在感と職人的なアクション演出が高く評価される一方で、物語の厚みや敵役の描き込みには物足りなさを感じるという声も一定数見られる',
        url: 'https://example.com/imdb',
      },
      ...defaultSites.slice(1),
    ],
  },
}

export const RTDivergence: Story = {
  args: {
    sites: [
      { siteId: 'imdb', score: 7.1, summary: '主演の存在感は強いが、物語の密度には物足りなさもある', url: 'https://example.com/imdb' },
      { siteId: 'rt-critics', score: 95, summary: '批評家は演出の切れ味と構成力を高く評価している', url: 'https://example.com/rt-critics' },
      { siteId: 'rt-audience', score: 30, summary: '観客は期待した爽快感に届かなかったという反応が目立つ', url: 'https://example.com/rt-audience' },
      { siteId: 'filmarks', score: 3.7, summary: '国内では演者人気もあって一定の満足感が共有されている', url: 'https://example.com/filmarks' },
    ] satisfies TReviewSite[],
  },
}

export const SingleSite: Story = {
  args: {
    sites: [
      { siteId: 'imdb', score: 7.3, summary: '主演の存在感に高評価。プロットの薄さを指摘する声も', url: 'https://example.com/imdb' },
    ],
  },
}
