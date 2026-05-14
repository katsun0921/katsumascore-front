import type { Meta, StoryObj } from '@storybook/react';
import { PersonTemplate } from './PersonTemplate';

const meta: Meta<typeof PersonTemplate> = {
  title: 'Templates/PersonTemplate',
  component: PersonTemplate,
};
export default meta;

type Story = StoryObj<typeof PersonTemplate>;

const basePerson = {
  id: '1',
  slug: 'test-person',
  name: 'テスト 太郎',
  roles: ['actor', 'director'] as const,
  bio: 'サンプルのプロフィール文章です。俳優・監督として活動しています。',
  image: null,
};

export const ActorAndDirector: Story = {
  args: {
    person: basePerson,
    castPosts: [],
    directorPosts: [],
  },
};

export const ActorOnly: Story = {
  args: {
    person: { ...basePerson, name: '出演専門 花子', roles: ['actor'] },
    castPosts: [],
    directorPosts: [],
  },
};

export const DirectorOnly: Story = {
  args: {
    person: { ...basePerson, name: '監督専門 次郎', roles: ['director'] },
    castPosts: [],
    directorPosts: [],
  },
};

export const NoBio: Story = {
  args: {
    person: { ...basePerson, bio: undefined },
    castPosts: [],
    directorPosts: [],
  },
};

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    person: { ...basePerson, name: 'John Doe', lang: 'en' as const },
    castPosts: [],
    directorPosts: [],
  },
};
