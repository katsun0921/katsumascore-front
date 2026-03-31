import React from 'react';
import '@/scss/object/project/_content.scss';

interface PostContentProps {
  content: string;
  className?: string;
}

export const PostContent = ({
  content,
  className = '',
  ...props
}: PostContentProps) => {
  return (
    <div
      className={`p-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: content }}
      {...props}
    />
  );
};
