import type { PostCardKind } from '@/components/ui-section/PostCard/types'

export type { PostCardKind }

export type RelationPostItem = {
  id: number
  title: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type RelationPostLayout = 'default' | 'three-column'

export type RelationPostProps = {
  heading: string
  posts: RelationPostItem[]
  layout?: RelationPostLayout
  kind?: PostCardKind
}
