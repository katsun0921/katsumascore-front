import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';

const Slide = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      background: color,
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '24px',
      fontWeight: 'bold',
    }}
  >
    {label}
  </div>
);

const meta: Meta<typeof Carousel> = {
  title: 'features/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  args: {
    label: 'スライドショー',
    items: [
      <Slide key={1} label='Slide 1' color='#2563eb' />,
      <Slide key={2} label='Slide 2' color='#6d28d9' />,
      <Slide key={3} label='Slide 3' color='#1e1b4b' />,
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>

export const ThreeSlides: Story = {};
export const SingleSlide: Story = {
  args: { items: [<Slide key={1} label='Single' color='#2563eb' />] },
};
export const ManySlides: Story = {
  args: {
    items: Array.from({ length: 6 }, (_, i) => (
      <Slide key={i} label={`Slide ${i + 1}`} color={`hsl(${i * 40}, 60%, 50%)`} />
    )),
  },
};
