import type { PostCardKind } from '@/components/ui-section/PostCard'

export type RelationPostItem = {
  id: number
  title: string
  href: string
  imageUrl?: string
  imageAlt?: string
}

export type RelationPostProps = {
  heading: string
  posts: RelationPostItem[]
  kind?: PostCardKind
}
