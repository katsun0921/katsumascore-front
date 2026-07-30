import { Breadcrumb } from "@/components/ui-parts/Breadcrumb";
import { PageLayout } from "@/components/templates/PageLayout";
import { ListFilterBar } from "@/components/features/Post/ListFilterBar";
import { PostCardImgLeft } from "@/components/ui-section/PostCard/PostCardImgLeft";
import type { SearchResultTemplateProps } from "./SearchResultTemplate.types";

export const SearchResultTemplate = ({
  breadcrumbItems,
  categoryLabel,
  heading,
  description,
  query,
  posts,
  filterOptions,
  activeFilter,
  onFilterSelect,
  isLoading,
  loadingMessage,
  emptyQueryMessage,
  emptyResultsMessage,
}: SearchResultTemplateProps) => {
  const showStatusRow = isLoading || !query || (query.length > 0 && posts.length === 0);

  return (
    <PageLayout>
      <div data-component='SearchResultTemplate'>
        <div className='bg-secondary'>
          <div className='px-4 pt-3 pb-0'>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <section className='px-4 py-8 md:py-12'>
            <div className='space-y-2'>
              <p className='font-ui text-xs tracking-[0.2em] text-score-accent uppercase'>{categoryLabel}</p>
              <h1 className='font-bold text-color-inverse'>{heading}</h1>
              {description ? (
                <p className='text-sm text-[rgba(255,255,255,0.7)]'>{description}</p>
              ) : null}
            </div>
          </section>
        </div>

        <div className='py-4 px-4 bg-color-bg border-b border-color-border'>
          <ListFilterBar options={filterOptions} activeValue={activeFilter} onSelect={onFilterSelect} />
        </div>

        <div className='px-4 py-8 pb-12'>
          {showStatusRow ? (
            <p className='text-sm text-color-secondary mb-4'>
              {isLoading ? loadingMessage : null}
              {!isLoading && !query ? emptyQueryMessage : null}
              {!isLoading && query && posts.length === 0 ? emptyResultsMessage : null}
            </p>
          ) : null}

          {!isLoading && query && posts.length > 0 ? (
            <ul className='flex flex-col gap-6 list-none m-0 p-0'>
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCardImgLeft post={post} highlightKeyword={query} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};
