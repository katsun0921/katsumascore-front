import type { Meta, StoryObj } from '@storybook/react-vite';
import { sayoMockArticles, sayoMockChaosArticle, sayoMockManyArticles } from '@/mocks/sayo';
import { SayoShelf } from './SayoShelf';

const meta = {
  title: 'UI-Section/Sayo/SayoShelf',
  component: SayoShelf,
  parameters: { layout: 'padded' },
  args: { articles: [sayoMockArticles[2], sayoMockArticles[4]], currentId: 1203, onTalk: () => {} },
  decorators: [
    (Story) => (
      <div className='max-w-3xl bg-[var(--color-sayo-stage)] p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SayoShelf>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 作品の話：いま話している作品＋似た作品 */
export const Talking: Story = {};

/** 探した結果：すべてに「この作品の話を聞く」 */
export const Search: Story = { args: { articles: [sayoMockArticles[0], sayoMockArticles[2]], currentId: undefined } };

/** 異常系：長い作品名・画像なし */
export const MixedData: Story = { args: { articles: [sayoMockChaosArticle, sayoMockArticles[0]], currentId: undefined } };

/** 異常系：20件（横スクロール） */
export const Extreme: Story = { args: { articles: sayoMockManyArticles(20), currentId: undefined } };

/** 空：何も描かない */
export const Empty: Story = { args: { articles: [] } };
