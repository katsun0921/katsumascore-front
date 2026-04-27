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
    rating: 'PG12',
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
    rating: undefined,
  },
};

export const English: Story = {
  globals: { locale: 'en' },
};
