import type { Meta, StoryObj } from '@storybook/react-vite';
import { CinemaCheck } from './CinemaCheck';

const meta: Meta<typeof CinemaCheck> = {
  title: 'ui-section/CinemaCheck',
  component: CinemaCheck,
  parameters: { layout: 'padded' },
  args: {
    badgeLabel: '劇場公開中',
    message: '現在劇場で公開中です。ぜひ映画館でご覧ください。',
  },
};
export default meta;

type Story = StoryObj<typeof meta>

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message: '現在全国の劇場で絶賛公開中です。IMAX・4DX・ドルビーシネマなど各種上映形式で上映しています。公式サイトでお近くの劇場と上映時間をご確認ください。',
  },
};

export const ShortMessage: Story = {
  args: {
    badgeLabel: '上映中',
    message: '公開中',
  },
};
