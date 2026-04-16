import Link from 'next/link';

type HeadingProps = {
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

const typeToClass: Record<string, string> = {
  title: [
    'inline-block mx-auto text-center break-words font-medium leading-[1.4]',
    'text-[var(--color-text-inverse)] [font-size:clamp(32px,5vw,68px)]',
    '[text-shadow:0_0_10px_var(--color-text-primary)]',
  ].join(' '),

  post: [
    'inline-block text-[var(--color-text-dark)] [font-size:clamp(1.5rem,2vw,2rem)]',
    '[&_a]:text-[var(--color-primary)] [&_a:hover]:text-[var(--color-primary)]',
  ].join(' '),

  related: [
    'relative pb-4 italic uppercase',
    'text-[var(--color-secondary)] font-[var(--font-accent-soft)] [font-size:clamp(1.5rem,2vw,2rem)]',
    "before:absolute before:bottom-0 before:block before:h-[3px] before:w-[35px] before:bg-[var(--color-primary)] before:content-['']",
  ].join(' '),

  'bg-accent': [
    'p-[0.5em] rounded-[5px]',
    'shadow-[0_2px_4px_rgba(var(--color-primary-rgb),0.3)]',
    'bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary)_100%)]',
    'text-[var(--color-text-inverse)] [font-size:clamp(1.5rem,2vw,2rem)]',
  ].join(' '),

  'bg-gradient': [
    'p-[0.5em] rounded-lg',
    'shadow-[0_2px_4px_rgba(var(--color-primary-rgb),0.3)]',
    'bg-[linear-gradient(135deg,var(--color-heading-gradient-start)_0%,var(--color-heading-gradient-end)_100%)]',
    'text-[var(--color-text-inverse)] [font-size:clamp(1.5rem,2vw,2rem)]',
  ].join(' '),

  ribbon: [
    'relative px-8 py-4 bg-[var(--color-primary)] text-[var(--color-text-inverse)] [font-size:clamp(1.5rem,2vw,2rem)]',
    "before:absolute before:top-full before:left-0 before:content-['']",
    'before:border-t-[15px] before:border-t-[var(--color-primary)]',
    'before:border-r-[15px] before:border-r-transparent',
    'before:border-l-[15px] before:border-l-transparent',
  ].join(' '),

  'bg-wrap': [
    'relative py-5 pl-5 pr-10 rounded-lg',
    'bg-[linear-gradient(135deg,var(--color-heading-gradient-start)_0%,var(--color-heading-gradient-end)_100%)]',
    'text-[var(--color-text-inverse)] [font-size:clamp(1.5rem,2vw,2rem)]',
    "after:absolute after:top-1/2 after:right-[15px] after:h-0 after:w-0 after:content-['']",
    'after:-translate-y-1/2',
    'after:border-r-[20px] after:border-r-transparent',
    'after:border-b-[20px] after:border-b-[rgba(var(--color-white-rgb),0.2)]',
    'after:border-l-[20px] after:border-l-transparent',
    'after:rounded-full',
  ].join(' '),

  quote: [
    'relative px-10 py-5 text-[var(--color-text-dark)] [font-size:clamp(1.5rem,2vw,2rem)]',
    "before:absolute before:top-[-10px] before:left-[10px] before:text-[var(--color-primary)] before:text-[3em] before:font-bold before:content-['\\201C']",
    "after:absolute after:bottom-[-20px] after:right-[10px] after:text-[var(--color-primary)] after:text-[3em] after:font-bold after:content-['\\201C']",
  ].join(' '),

  'gold-text': [
    'bg-[linear-gradient(45deg,var(--color-heading-gold-start),var(--color-heading-gold-end),var(--color-heading-gold-start))]',
    'bg-clip-text text-transparent [background-size:200%_200%]',
    '[font-size:clamp(1.5rem,2vw,2rem)] font-bold',
    '[-webkit-text-fill-color:transparent]',
    'animate-[heading-gold-shine_3s_ease-in-out_infinite]',
  ].join(' '),
};

export const Heading = ({
  headingLevel,
  type,
  isLink = false,
  label = 'title の見出し',
}: HeadingProps) => {
  const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const className = type ? typeToClass[type] ?? '' : '';

  return isLink ? (
    <HeadingTag className={className}>
      <Link href='#'>{label}</Link>
    </HeadingTag>
  ) : (
    <HeadingTag className={className}>{label}</HeadingTag>
  );
};
