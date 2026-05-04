import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockPost, mockPostLongTitle } from "@/mocks/post";
import { SearchResultTemplate } from "./SearchResultTemplate";

const meta = {
  title: "templates/SearchResultTemplate",
  component: SearchResultTemplate,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SearchResultTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithResults: Story = {
  args: {
    breadcrumbItems: [
      { label: "Home", href: "/" },
      { label: "Search results" },
    ],
    categoryLabel: "Search",
    heading: "Search results: mission",
    description: "Ranked by relevance.",
    query: "mission",
    posts: [mockPost, mockPostLongTitle],
    filterOptions: [
      { value: "all", label: "All" },
      { value: "actor", label: "Actor" },
      { value: "director", label: "Director" },
      { value: "genre", label: "Genre" },
    ],
    activeFilter: "all",
    onFilterSelect: () => {},
    isLoading: false,
    loadingMessage: "Loading…",
    emptyQueryMessage: "Enter a keyword.",
    emptyResultsMessage: "No posts found.",
  },
};

export const Loading: Story = {
  args: {
    ...WithResults.args,
    isLoading: true,
    posts: [],
  },
};

export const EmptyResults: Story = {
  args: {
    ...WithResults.args,
    posts: [],
    isLoading: false,
  },
};
