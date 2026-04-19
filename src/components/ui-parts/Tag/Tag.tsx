import Link from 'next/link';
import Image from 'next/image';

export type TTagsProps = {
  labels: string[];
};

export const Tags = ({ labels }: TTagsProps) => {
  return (
    <div className='flex items-center'>
      <Image
        src='/images/icon_tag.png'
        alt=''
        width={30}
        height={30}
        className='mr-2 block h-[30px] w-[30px] shrink-0 object-contain'
        unoptimized
      />
      {labels.map((label, i) => (
        <Link
          key={i}
          href='#'
          className='inline-block h-[30px] px-4 -skew-x-[8deg] bg-[rgba(var(--color-text-secondary-rgb),0.7)] text-[14px] leading-[30px] text-[var(--color-bg-muted)] transition-colors duration-150 hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] [&:not(:last-child)]:mr-2'
        >
          {label}
        </Link>
      ))}
    </div>
  );
};
