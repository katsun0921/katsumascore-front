import type { Meta, StoryObj } from '@storybook/react-vite';
import { Profile } from './Profile';

const meta: Meta<typeof Profile> = {
  title: 'ui-section/Profile',
  component: Profile,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>

const baseArgs = {
  comment: '最近はSF映画にハマってます。特にクリストファー・ノーラン作品は何度見ても飽きません！',
};

export const Default: Story = {
  args: baseArgs,
};

export const NoComment: Story = {
  args: { ...baseArgs, comment: undefined },
};

export const NoSocial: Story = {
  args: baseArgs,
};

export const Minimal: Story = {
  args: { ...baseArgs, comment: undefined },
};

export const LongComment: Story = {
  args: {
    ...baseArgs,
    comment:
      '最近はSF映画にハマってます。特にクリストファー・ノーラン作品は何度見ても飽きません！インターステラーは人生で一番好きな映画です。次はデューンのパート2が楽しみ！皆さんのおすすめも教えてください。',
  },
};

export const WithPostExcerpt: Story = {
  args: {
    ...baseArgs,
    excerpt:
      '本作は原作ファンにも評判の映像化。前半の世界観構築とラストの展開が見どころ。',
  },
};

export const English: Story = {
  args: baseArgs,
  globals: { locale: 'en' },
};
