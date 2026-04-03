import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, LinkFacebook, LinkTwitter } from './Link';

const meta: Meta<typeof Link> = {
  title: 'UI/Link',
  component: Link,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Link Container',
    backgroundColor: 'var(--color-primary)',
  },
};

export const SocialLinks: Story = {
  render: () => (
    <div className='grid gap-4'>
      <LinkTwitter />
      <LinkFacebook />
    </div>
  ),
};
