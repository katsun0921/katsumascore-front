import type { Meta, StoryObj } from '@storybook/react';
import { CompanyTemplate } from './CompanyTemplate';

const meta: Meta<typeof CompanyTemplate> = {
  title: 'Templates/CompanyTemplate',
  component: CompanyTemplate,
};
export default meta;

type Story = StoryObj<typeof CompanyTemplate>;

const baseCompany = {
  id: '1',
  slug: 'test-company',
  name: 'サンプル映像株式会社',
  roles: ['production', 'distributor'] as const,
  description: 'サンプルの企業説明文です。映画・ドラマの制作・配給を行っています。',
  logo: null,
};

export const ProductionAndDistributor: Story = {
  args: {
    company: baseCompany,
    productionPosts: [],
    distributorPosts: [],
  },
};

export const ProductionOnly: Story = {
  args: {
    company: { ...baseCompany, name: '制作専門スタジオ', roles: ['production'] },
    productionPosts: [],
    distributorPosts: [],
  },
};

export const DistributorOnly: Story = {
  args: {
    company: { ...baseCompany, name: '配給専門会社', roles: ['distributor'] },
    productionPosts: [],
    distributorPosts: [],
  },
};

export const NoDescription: Story = {
  args: {
    company: { ...baseCompany, description: undefined },
    productionPosts: [],
    distributorPosts: [],
  },
};

export const English: Story = {
  globals: { locale: 'en' },
  args: {
    company: { ...baseCompany, name: 'Sample Films Inc.', lang: 'en' as const },
    productionPosts: [],
    distributorPosts: [],
  },
};
