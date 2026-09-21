import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostHeader } from './PostHeader';

const meta: Meta<typeof PostHeader> = {
  title: 'features/post/PostHeader',
  component: PostHeader,
  parameters: {
    layout: 'padded',
  },
  args: {
    category: '映画',
    titleOfficial: 'ナイブズ・アウト／名探偵と刃の館の秘密',
    titleOriginal: 'Knives Out',
    filmStudios: [{ name: 'ライオンズゲート' }],
    productionStudios: [{ name: 'アメリカ' }],
    releaseDate: '20191127',
  },
};

export default meta;

type Story = StoryObj<typeof PostHeader>

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    titleOfficial: '劇場版『機動戦士ガンダム ジークアクス』',
    titleOriginal: 'Mobile Suit Gundam GQuuuuuuX -Beginning-',
  },
};

export const MultipleStudios: Story = {
  args: {
    filmStudios: [{ name: 'ソニー・ピクチャーズ' }, { name: 'アミューズ' }],
    productionStudios: [{ name: 'C&Iエンタテインメント' }, { name: 'フジテレビジョン' }],
  },
};

export const MinimalMeta: Story = {
  args: {
    filmStudios: undefined,
    productionStudios: undefined,
    releaseDate: undefined,
  },
};

export const WithRating: Story = {
  args: { rating: 'pg12' },
};

export const English: Story = {
  args: { rating: 'pg12' },
  globals: { locale: 'en' },
};

/** アニメ・ドラマ：話数とシーズン（まとめページへのリンク付き） */
export const WithEpisodesAndSeason: Story = {
  args: {
    titleOfficial: 'あかね噺',
    titleOriginal: 'Akane-banashi',
    filmStudios: undefined,
    productionStudios: [{ name: 'ZEXCS' }],
    releaseDate: '20260404',
    episodeCount: 12,
    releaseSeason: {
      title: '2026年春',
      href: '/ja/seasonal-reviews/2026-spring-anime-drame',
    },
  },
};

/** シーズンのスラッグが取得できない場合はリンクにしない */
export const SeasonWithoutLink: Story = {
  args: {
    episodeCount: 24,
    releaseSeason: { title: '2026年春' },
  },
};

/** 1話のみの作品（単数形。en では "1 episode"） */
export const SingleEpisode: Story = {
  args: {
    episodeCount: 1,
    releaseSeason: { title: '2026年夏', href: '/ja/seasonal-reviews/2026-summer-anime-drama' },
  },
};

/** 映画：話数・シーズンは未設定（従来どおりの表示） */
export const MovieWithoutEpisodes: Story = {
  args: {
    episodeCount: undefined,
    releaseSeason: undefined,
  },
};

/** 英語ロケール：話数は "12 episodes" 形式になる */
export const EnglishWithEpisodes: Story = {
  args: {
    episodeCount: 12,
    releaseSeason: { title: '2026 Spring', href: '/en/seasonal-reviews/2026-spring-anime-drame' },
  },
  globals: { locale: 'en' },
};
