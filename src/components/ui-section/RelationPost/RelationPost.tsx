import { publicAssetUrl } from '@/lib/publicAssetUrl'
import type { RelationPostProps } from './RelationPost.types'

export const RelationPost = ({ heading, posts, layout = 'default' }: RelationPostProps) => {
  const listClassName =
    layout === 'three-column'
      ? 'm-0 grid list-none grid-cols-1 gap-[var(--space-16)] p-0 min-[480px]:grid-cols-3'
      : 'm-0 grid list-none grid-cols-1 gap-[var(--space-16)] p-0 min-[480px]:grid-cols-2'

  return (
    <section>
      <h2 className='mb-[var(--space-16)] text-[var(--font-size-h3-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]'>
        {heading}
      </h2>
      <ul className={listClassName}>
        {posts.map((post) => (
          <li
            key={post.id}
            className='overflow-hidden rounded-[6px] border border-[var(--color-border-muted)] transition-shadow duration-150 hover:shadow-[0_2px_8px_rgb(0_0_0_/_0.12)]'
          >
            <a className='block text-inherit no-underline' href={post.href}>
              {post.imageUrl && (
                <div className='overflow-hidden bg-[var(--color-bg-muted)] [aspect-ratio:16/9]'>
                  <img
                    className='h-full w-full object-cover'
                    src={publicAssetUrl(post.imageUrl)}
                    alt={post.imageAlt || post.title}
                  />
                </div>
              )}
              <span className='block px-[var(--space-12)] py-[var(--space-12)] text-[var(--font-size-ui-lg)] font-[var(--font-weight-bold)] leading-[1.5] text-[var(--color-text-primary)]'>
                {post.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
