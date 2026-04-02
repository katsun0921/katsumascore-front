import React from 'react';

type HeadingProps = {
  color?: string;
  headingLevel: '1' | '2' | '3' | '4' | '5' | '6';
  type?: 'post' | 'title' | 'related' | 'underline' | 'dotted' | 'dashed' | 'double' |
         'bg-simple' | 'bg-accent' | 'bg-gradient' | 'bg-gradient-gold' | 'bg-wrap' |
         'border-simple' | 'border-accent' | 'border-gradient' |
         'shadow' | 'shadow-colored' | 'tag' | 'tag-rounded' |
         'ribbon' | 'speech' | 'checkered' | 'striped' |
         'outline' | 'outline-colored' | '3d' | 'quote' | 'gold-text' |
         'content-h2' | 'content-h3' | 'content-h4';
  isLink: boolean;
  label: string;
};

export const Heading = ({
  headingLevel,
  isLink = false,
  label = 'title の見出し',
}: HeadingProps) => {
  const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <>
      {isLink ? (
        <HeadingTag>
          <a href='#'>{label}</a>
        </HeadingTag>
      ) : (
        <HeadingTag>{label}</HeadingTag>
      )}
    </>
  );
};
