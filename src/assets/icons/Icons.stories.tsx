import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayIcon } from './PlayIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { CloseIcon } from './CloseIcon';
import { XIcon } from './XIcon';
import { FacebookIcon } from './FacebookIcon';
import { RssIcon } from './RssIcon';
import { StarIcon } from './StarIcon';

const meta: Meta = {
  title: 'Assets/Icons',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>

const ICON_SIZES = [12, 14, 16, 18, 24, 32] as const;

const iconList = [
  { name: 'PlayIcon', usage: 'CTAButton / VodLink / VodMenu', Icon: PlayIcon, fill: 'currentColor' },
  { name: 'ChevronDownIcon', usage: 'VodMenu', Icon: ChevronDownIcon, fill: 'currentColor' },
  { name: 'CloseIcon', usage: 'HomeShorts', Icon: CloseIcon, fill: 'currentColor' },
  { name: 'XIcon', usage: 'Footer / Profile', Icon: XIcon, fill: 'currentColor' },
  { name: 'FacebookIcon', usage: 'Footer', Icon: FacebookIcon, fill: 'currentColor' },
  { name: 'RssIcon', usage: 'Footer', Icon: RssIcon, fill: 'currentColor' },
  { name: 'StarIcon', usage: 'HomeCardScrollList', Icon: StarIcon, fill: 'var(--color-score-accent, #f59e0b)' },
];

export const All: Story = {
  name: 'すべてのアイコン',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '24px' }}>
      {iconList.map(({ name, usage, Icon, fill }) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
            <Icon width='24' height='24' fill={fill} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{name}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>{usage}</p>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: 'サイズバリエーション',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {ICON_SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', width: '40px', flexShrink: 0 }}>{size}px</span>
          {iconList.map(({ name, Icon, fill }) => (
            <Icon key={name} width={size} height={size} fill={fill} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const OnDark: Story = {
  name: 'ダーク背景',
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', padding: '16px', color: 'white' }}>
      {iconList.map(({ name, Icon }) => (
        <Icon key={name} width='24' height='24' fill='currentColor' />
      ))}
    </div>
  ),
};
