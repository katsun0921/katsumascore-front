import React from 'react';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';
import { PostTopImage } from '@/components/features/post/PostTopImage/PostTopImage';
import type { PostCardData } from '@/components/features/post/PostCard/PostCard.types';

type HomeTemplateProps = {
  posts: PostCardData[];
};

export const HomeTemplate = ({ posts }: HomeTemplateProps) => {
  return (
    <PageLayout>
      {posts.length === 0 ? (
        <p>記事が見つかりませんでした</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostTopImage key={post.id} post={post} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};
