import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LinkSocialIcon,
  LinkFacebookIcon,
  LinkTwitterIcon,
  LinkRssIcon,
} from './LinkSocialIcon';

const meta: Meta<typeof LinkSocialIcon> = {
  title: 'UI/LinkSocialIcon',
  component: LinkSocialIcon,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Social Icon Wrapper',
  },
};

export const Icons: Story = {
  render: () => (
    <div className='flex gap-4'>
      <LinkTwitterIcon />
      <LinkFacebookIcon />
      <LinkRssIcon />
    </div>
  ),
};
