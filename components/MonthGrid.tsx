import dayjs from 'dayjs';
import DayCell from './DayCell';

const weekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface MonthGridProps {
  /** Month in YYYY-MM format */
  month: string;
}

export default function MonthGrid({ month }: MonthGridProps) {
  const start = dayjs(`${month}-01`);
  const daysInMonth = start.daysInMonth();
  const firstDay = start.day(); // Sunday = 0

  const cells: Array<string | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-7 gap-1 text-center text-sm">
      {weekdays.map((w) => (
        <div key={w} className="font-medium py-1">
          {w}
        </div>
      ))}
      {cells.map((date, idx) =>
        date ? <DayCell key={date} date={date} /> : <div key={idx} />,
      )}
    </div>
  );
}
