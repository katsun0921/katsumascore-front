import { Fragment } from "react";

type Props = {
  text: string;
  keyword: string;
};

export const HighlightText = ({ text, keyword }: Props) => {
  const q = keyword.trim();
  if (!q) return <>{text}</>;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === q.toLowerCase();
        if (isMatch) {
          return (
            <mark
              key={index}
              className='rounded-sm bg-[var(--color-highlight-mark)] text-[var(--color-text-primary)]'
            >
              {part}
            </mark>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
};
