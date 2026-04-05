import Link from 'next/link';
import './CTAButton.scss';

type Props = {
  href: string;
  fullWidth?: boolean;
};

export const CTAButton = ({ href, fullWidth = false }: Props) => {
  return (
    <Link
      href={href}
      className={`cta-button${fullWidth ? ' cta-button--full' : ''}`}
    >
      <svg
        className="cta-button__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="cta-button__label">配信中</span>
    </Link>
  );
};
