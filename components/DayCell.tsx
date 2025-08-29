import type { FC } from 'react';

interface DayCellProps {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
}

const DayCell: FC<DayCellProps> = ({ date }) => {
  const day = Number(date.slice(-2));
  return (
    <div className="border rounded-sm flex items-center justify-center aspect-square text-sm">
      {day}
    </div>
  );
};

export default DayCell;
