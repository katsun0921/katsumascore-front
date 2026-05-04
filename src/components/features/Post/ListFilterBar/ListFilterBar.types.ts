export type FilterOption = {
  label: string;
  value: string;
  href?: string;
};

export type ListFilterBarProps = {
  options: FilterOption[];
  optionRows?: FilterOption[][];
  activeValue: string | string[];
  onSelect?: (value: string) => void;
  className?: string;
};
