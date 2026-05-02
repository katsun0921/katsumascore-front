import type { Meta, StoryObj } from "@storybook/react-vite";
import { HighlightText } from "./HighlightText";

const meta: Meta<typeof HighlightText> = {
  title: "ui-parts/HighlightText",
  component: HighlightText,
};

export default meta;

type Story = StoryObj<typeof HighlightText>;

export const Default: Story = {
  args: {
    text: "ストレンジャー・シングス シーズン4",
    keyword: "シングス",
  },
};

export const NoKeyword: Story = {
  args: {
    text: "Plain title",
    keyword: "",
  },
};

export const CaseInsensitive: Story = {
  args: {
    text: "Mission: Impossible",
    keyword: "mission",
  },
};
