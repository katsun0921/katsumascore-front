import type { ReactNode } from "react";
import { HighlightText } from "@/components/ui-parts/HighlightText";
import type { PostCardBodyProps } from "./PostCardBody.types";

const BR_TAG_PATTERN = /<br\s*\/?>/i;

const renderTitleWithLineBreaks = (title: string) => {
  const titleLines = title.split(/<br\s*\/?>/gi);

  return titleLines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < titleLines.length - 1 && <br />}
    </span>
  ));
};

export const PostCardBody = ({
  publishedAt,
  title,
  excerpt,
  category,
  className,
  highlightKeyword,
  caption,
}: PostCardBodyProps) => {
  let titleContent: ReactNode = title;
  if (BR_TAG_PATTERN.test(title)) {
    titleContent = renderTitleWithLineBreaks(title);
  }
  if (highlightKeyword?.trim() && !BR_TAG_PATTERN.test(title)) {
    titleContent = <HighlightText text={title} keyword={highlightKeyword} />;
  }

  return (
    <div data-component='PostCardBody' className={['postCard__body grid gap-3 px-4 pb-5 pt-4 md:p-5', className].filter(Boolean).join(' ')}>
      {publishedAt && (
        <time className='postCard__date' dateTime={publishedAt}>
          {publishedAt}
        </time>
      )}
      <hgroup className='postCard__titleGroup'>
        <h3 className='postCard__title'>{titleContent}</h3>
        {caption && <span className='postCard__character'>{caption}</span>}
      </hgroup>
      {excerpt && <p className='postCard__excerpt'>{excerpt}</p>}
      {category && <p className='postCard__category'>{category}</p>}
    </div>
  );
};
