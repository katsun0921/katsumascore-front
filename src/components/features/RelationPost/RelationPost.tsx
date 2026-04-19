import { RelationPost as RelationPostSection } from '@/components/ui-section/RelationPost'
import { relationPostConfig } from '@/components/ui-section/RelationPost/RelationPost.config'
import type { PostCardKind } from '@/components/ui-section/PostCard/types'

export type TRelationPostItem = {
  id: number
  title: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type TRelationPostProps = {
  posts: TRelationPostItem[]
  locale?: 'ja' | 'en'
  kind?: PostCardKind
}

export const RelationPost = ({ posts, locale = 'ja', kind }: TRelationPostProps) => {
  if (!posts.length) return null

  const layout = posts.length === 3 ? 'three-column' : 'default'

  return <RelationPostSection heading={relationPostConfig[locale].heading} posts={posts} layout={layout} kind={kind} />
}
