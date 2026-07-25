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

export const Actor: Story = { args: { roles: ['actor'], gender: 'male' } };
export const Actress: Story = { args: { roles: ['actress'], gender: 'female' } };
export const Director: Story = { args: { roles: ['director'], gender: 'male' } };
export const VoiceActor: Story = { args: { roles: ['voice_actor'], gender: 'female' } };
export const NoRoleData: Story = { args: { roles: [], gender: '' } };
export const LegacyActorFemale: Story = { args: { roles: ['actor'], gender: 'female' } };
