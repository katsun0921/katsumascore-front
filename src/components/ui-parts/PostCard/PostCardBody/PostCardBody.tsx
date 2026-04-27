import type { PostCardBodyProps } from './PostCardBody.types';

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
}: PostCardBodyProps) => {
  const titleContent = BR_TAG_PATTERN.test(title) ? renderTitleWithLineBreaks(title) : title;

  return (
    <div className={['postCard__body grid gap-3 px-4 pb-5 pt-4 md:p-5', className].filter(Boolean).join(' ')}>
      {publishedAt && (
        <time className='postCard__date' dateTime={publishedAt}>
          {publishedAt}
        </time>
      )}
      <h3 className='postCard__title'>{titleContent}</h3>
      {excerpt && <p className='postCard__excerpt'>{excerpt}</p>}
      {category && <p className='postCard__category'>{category}</p>}
    </div>
  );
};
