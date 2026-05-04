import type { Meta, StoryObj } from '@storybook/react-vite';
import { TitleMeta } from './PostTitleMeta';

const meta: Meta<typeof TitleMeta> = {
  title: 'features/TitleMeta',
  component: TitleMeta,
  tags: ['autodocs'],
  args: {
    releaseDate: '20240407',
    officialUrl: 'https://kimetsu.com',
    officialSns: {
      x: { link: 'https://x.com/kimetsu_off' },
      youtube_channel: { link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      instagram: { link: 'https://www.instagram.com/kimetsu_off' },
    },
    copyright: '© 吾峠呼世晴/集英社・アニプレックス・ufotable',
  },
};
export default meta;

type Story = StoryObj<typeof TitleMeta>

export const Japanese: Story = {};
export const English: Story = { globals: { locale: 'en' } };
export const Minimal: Story = {
  args: {
    officialUrl: 'https://kimetsu.com',
    officialSns: undefined,
  },
};
export const WithCredits: Story = {
  args: {
    credits: [
      { role: '監督', names: ['外崎春雄'] },
      { role: 'キャラクターデザイン', names: ['松島晃'] },
      { role: '音楽', names: ['梶浦由記', 'Elliott Smith'] },
      { role: '制作', names: ['ufotable'] },
    ],
  },
};

export const WithActors: Story = {
  args: {
    credits: [
      { role: '監督', names: ['クリストファー・ノーラン'] },
    ],
    actors: [
      {
        actorName: 'レオナルド・ディカプリオ',
        character: 'コブ',
        description: '企業スパイ。夢の中に侵入し情報を盗む専門家。',
        otherWorks: [
          { title: 'インセプション', href: '/posts/inception', score: 9.0 },
          { title: 'ダークナイト', href: '/posts/dark-knight', score: 9.5 },
          { title: 'インターステラー', href: '/posts/interstellar', score: 8.8 },
        ],
      },
      {
        actorName: 'エミリー・ブラント',
        character: 'キャサリン',
        otherWorks: [
          { title: 'クワイエット・プレイス', href: '/posts/quiet-place' },
          { title: 'オール・ユー・ニード・イズ・キル', href: '/posts/all-you-need-is-kill' },
        ],
      },
      {
        actorName: 'ロバート・ダウニー・Jr',
        description: 'マーベル作品で広く知られる。',
        otherWorks: [
          { title: 'アイアンマン', href: '/posts/iron-man' },
          { title: 'アベンジャーズ', href: '/posts/avengers' },
        ],
      },
    ],
  },
};

export const CreditsAndActors: Story = {
  args: {
    credits: [
      { role: '監督', names: ['外崎春雄'] },
      { role: '脚本', names: ['ufotable'] },
    ],
    actors: [
      {
        actorName: '花江夏樹',
        character: '竈門炭治郎',
        otherWorks: [
          { title: '東京喰種', href: '/posts/tokyo-ghoul' },
          { title: 'ノーゲーム・ノーライフ', href: '/posts/no-game-no-life' },
        ],
      },
      {
        actorName: '鬼頭明里',
        character: '竈門禰豆子',
        otherWorks: [
          { title: '僕のヒーローアカデミア', href: '/posts/mha' },
          { title: '五等分の花嫁', href: '/posts/gotoubun' },
          { title: 'ヴァイオレット・エヴァーガーデン', href: '/posts/violet' },
        ],
      },
    ],
    officialUrl: 'https://kimetsu.com',
    officialSns: {
      x: { link: 'https://x.com/kimetsu_off' },
    },
  },
};
