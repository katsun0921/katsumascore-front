import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/types/post'
export type TPostsGroupItem = {
  heading: string
  description?: string
  posts: Post[]
}

export type TPostsGroupProps = {
  groups: TPostsGroupItem[]
}

const PostThumb = ({ post }: { post: Post }) => (
  <li className='p-posts-group__item'>
    <Link href={post.slug} className='p-posts-group__link'>
      <div className='p-posts-group__thumb'>
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes='(max-width: 768px) 100vw, 300px'
            className='p-posts-group__image'
          />
        ) : (
          <div className='p-posts-group__fallback'>
            <span>No Image</span>
          </div>
        )}
      </div>
      <span className='p-posts-group__title'>{post.title}</span>
    </Link>
  </li>
)

export const PostsGroup = ({ groups }: TPostsGroupProps) => {
  const validGroups = groups.filter((g) => g.posts.length > 0)
  if (!validGroups.length) return null

  return (
    <>
      {validGroups.map((group, i) => (
        <section key={i} className='p-posts-group'>
          <h2 className='p-posts-group__heading'>{group.heading}</h2>
          {group.description && (
            <p className='p-posts-group__description'>{group.description}</p>
          )}
          <ul className='p-posts-group__list'>
            {group.posts.map((post) => (
              <PostThumb key={post.id} post={post} />
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
