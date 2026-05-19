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
      { role: '監督', names: [{ name: '外崎春雄', href: '/director/sotodzaki-haruo' }] },
      { role: 'キャラクターデザイン', names: [{ name: '松島晃' }] },
      { role: '音楽', names: [{ name: '梶浦由記', href: '/director/kajiura-yuki' }, { name: 'Elliott Smith' }] },
      { role: '制作', names: [{ name: 'ufotable' }] },
    ],
  },
};

export const WithActors: Story = {
  args: {
    credits: [
      { role: '監督', names: [{ name: 'クリストファー・ノーラン', href: '/director/christopher-nolan' }] },
    ],
    actors: [
      {
        actorName: 'レオナルド・ディカプリオ',
        character: 'コブ',
        description: '企業スパイ。夢の中に侵入し情報を盗む専門家。',
      },
      {
        actorName: 'エミリー・ブラント',
        character: 'キャサリン',
      },
      {
        actorName: 'ロバート・ダウニー・Jr',
        description: 'マーベル作品で広く知られる。',
      },
    ],
  },
};

export const CreditsAndActors: Story = {
  args: {
    credits: [
      { role: '監督', names: [{ name: '外崎春雄', href: '/director/sotodzaki-haruo' }] },
      { role: '脚本', names: [{ name: 'ufotable' }] },
    ],
    actors: [
      {
        actorName: '花江夏樹',
        character: '竈門炭治郎',
      },
      {
        actorName: '鬼頭明里',
        character: '竈門禰豆子',
      },
    ],
    officialUrl: 'https://kimetsu.com',
    officialSns: {
      x: { link: 'https://x.com/kimetsu_off' },
    },
  },
};
