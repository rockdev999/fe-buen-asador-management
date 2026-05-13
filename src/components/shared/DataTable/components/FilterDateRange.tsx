import { RangeDatePicker } from "../../Interactives/datePicker.tsx/DatePicker";

interface FilterDateRangeProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  max?: string;
  min?: string;
}

export function FilterDateRange({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  max,
  min,
}: FilterDateRangeProps) {
  return (
    <RangeDatePicker
      fromValue={fromValue}
      toValue={toValue}
      onFromChange={onFromChange}
      onToChange={onToChange}
      min={min}
      max={max}
    />
  );
}
