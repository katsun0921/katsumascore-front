import type { Meta, StoryObj } from '@storybook/react-vite'
import { VodItem } from './VodItem'

const meta: Meta<typeof VodItem> = {
  title: 'ui/VodItem',
  component: VodItem,
  tags: ['autodocs'],
  args: {
    streamingUrl: 'https://example.com/watch',
    signupUrl: 'https://example.com/signup',
    locale: 'ja',
  },
}
export default meta

type Story = StoryObj<typeof VodItem>

export const Netflix: Story = { args: { service: 'netflix' } }
export const Amazon: Story = { args: { service: 'amazon' } }
export const Unext: Story = { args: { service: 'unext' } }
export const Disney: Story = { args: { service: 'disney' } }
export const Paid: Story = { args: { service: 'netflix', isPaid: true } }
export const English: Story = { args: { service: 'amazon', locale: 'en' } }
export const NoSignup: Story = { args: { service: 'youtube', signupUrl: undefined } }
