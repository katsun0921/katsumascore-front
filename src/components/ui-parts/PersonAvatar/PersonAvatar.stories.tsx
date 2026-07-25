import type { Meta, StoryObj } from '@storybook/react-vite';
import { PersonAvatar } from './PersonAvatar';

const meta: Meta<typeof PersonAvatar> = {
  title: 'Ui-Parts/PersonAvatar',
  component: PersonAvatar,
  tags: ['autodocs'],
  args: {
    name: 'サンプル',
    className: 'h-[320px] w-[240px] rounded-lg bg-[var(--color-surface-2)]',
  },
};
export default meta;

type Story = StoryObj<typeof PersonAvatar>

export const Actor: Story = { args: { roles: ['actor'] } };
export const Actress: Story = { args: { roles: ['actress'] } };
export const Director: Story = { args: { roles: ['director'] } };
export const VoiceActor: Story = { args: { roles: ['voice_actor'] } };
export const NoRoleData: Story = { args: { roles: [] } };
export const MultipleRoles: Story = { args: { roles: ['actor', 'director'] } };
