export type FilterOption = {
  label: string;
  value: string;
};

export type ListFilterBarProps = {
  options: FilterOption[];
  activeValue: string;
  onSelect: (value: string) => void;
  className?: string;
};
