import './Tag.scss';

export type TTagsProps = {
  labels: string[];
};

export const Tags = ({ labels }: TTagsProps) => {
  return (
    <div className='tags'>
      {labels.map((label, _i) => (
        <a key={_i} href='#'>{label}</a>
      ))}
    </div>
  );
};
