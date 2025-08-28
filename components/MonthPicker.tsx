'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
  month: string; // YYYY-MM
  disabled?: boolean;
}

export default function MonthPicker({ value, onChange, month, disabled }: Props) {
  const [year, m] = month.split('-').map(Number);
  const first = new Date(year, m - 1, 1).toISOString().slice(0, 10);
  const last = new Date(year, m, 0).toISOString().slice(0, 10);
  return (
    <input
      type="date"
      min={first}
      max={last}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="border p-1"
    />
  );
}
