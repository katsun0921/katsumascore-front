import { RelationPost as RelationPostSection } from '@/components/ui-section/RelationPost'
import { relationPostConfig } from '@/components/ui-section/RelationPost/RelationPost.config'
import { useLocale } from '@/i18n/provider'
import type { PostCardKind } from '@/components/ui-section/PostCard'

export type TRelationPostItem = {
  id: number
  title: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type TRelationPostProps = {
  posts: TRelationPostItem[]
  kind?: PostCardKind
}

export const RelationPost = ({ posts, kind }: TRelationPostProps) => {
  const locale = useLocale()

  if (!posts.length) return null

  return <RelationPostSection heading={relationPostConfig[locale].heading} posts={posts} kind={kind} />
}
