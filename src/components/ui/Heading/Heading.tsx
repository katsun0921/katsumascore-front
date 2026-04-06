import './Heading.scss';

type HeadingProps = {
  color?: string;
  headingLevel: '1' | '2' | '3' | '4' | '5' | '6';
  type?: 'post' | 'title' | 'related' | 'underline' | 'dotted' | 'dashed' | 'double' |
         'bg-simple' | 'bg-accent' | 'bg-gradient' | 'bg-gradient-gold' | 'bg-wrap' |
         'border-simple' | 'border-accent' | 'border-gradient' |
         'shadow' | 'shadow-colored' | 'tag' | 'tag-rounded' |
         'ribbon' | 'speech' | 'checkered' | 'striped' |
         'outline' | 'outline-colored' | '3d' | 'quote' | 'gold-text';
  isLink: boolean;
  label: string;
};

export const Heading = ({
  headingLevel,
  type,
  isLink = false,
  label = 'title の見出し',
}: HeadingProps) => {
  const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const typeToClass: Record<string, string> = {
    post: 'heading__post',
    title: 'heading__title',
    related: 'heading__related',
    underline: 'heading__underline',
    dotted: 'heading__dotted',
    dashed: 'heading__dashed',
    double: 'heading__double',
    'bg-simple': 'heading__bg-simple',
    'bg-accent': 'heading__bg-accent',
    'bg-gradient': 'heading__bg-gradient',
    'bg-gradient-gold': 'heading__bg-gradient-gold',
    'bg-wrap': 'heading__bg-wrap',
    'border-simple': 'heading__border-simple',
    'border-accent': 'heading__border-accent',
    'border-gradient': 'heading__border-gradient',
    shadow: 'heading__shadow',
    'shadow-colored': 'heading__shadow-colored',
    tag: 'heading__tag',
    'tag-rounded': 'heading__tag-rounded',
    ribbon: 'heading__ribbon',
    speech: 'heading__speech',
    checkered: 'heading__checkered',
    striped: 'heading__striped',
    outline: 'heading__outline',
    'outline-colored': 'heading__outline-colored',
    '3d': 'heading__3d',
    quote: 'heading__quote',
    'gold-text': 'heading__gold-text',
  };
  const className = type ? typeToClass[type] ?? 'heading' : 'heading';

  return (
    <>
      {isLink ? (
        <HeadingTag className={className}>
          <a href='#'>{label}</a>
        </HeadingTag>
      ) : (
        <HeadingTag className={className}>{label}</HeadingTag>
      )}
    </>
  );
};
