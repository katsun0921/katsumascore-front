import type { Meta, StoryObj } from '@storybook/react-vite';
import { sayoMockArticles, sayoMockChaosArticle, sayoMockManyArticles } from '@/mocks/sayo';
import { SayoSearchResults } from './SayoSearchResults';

const meta = {
  title: 'UI-Section/Sayo/SayoSearchResults',
  component: SayoSearchResults,
  parameters: { layout: 'padded' },
  args: { articles: [sayoMockArticles[0], sayoMockArticles[2]], source: 'tags', onSummary: () => {} },
  decorators: [
    (Story) => (
      <div className='max-w-xl bg-[var(--color-sayo-paper)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoSearchResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 自由入力（AIが探した） */
export const Llm: Story = { args: { source: 'llm', articles: sayoMockArticles.slice(3, 6) } };

/** 異常系：長い作品名・画像なし・タグなしが混ざる */
export const MixedData: Story = { args: { articles: [sayoMockChaosArticle, sayoMockArticles[1]] } };

/** 異常系：10件（APIは最大3件だが、崩れないか） */
export const Dense: Story = { args: { articles: sayoMockManyArticles(10) } };
