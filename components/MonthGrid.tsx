import { parseISO, getDaysInMonth } from 'date-fns';
import DayCell, { DayEntry } from './DayCell';

const weekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

interface MonthGridProps {
  /** Month in YYYY-MM format */
  month: string;
  entries: Record<string, DayEntry>;
  onChange: (
    date: string,
    value: DayEntry | null,
    bulk?: 'weekdays' | 'weekends' | 'all',
  ) => void;
}

export default function MonthGrid({
  month,
  entries,
  onChange,
}: MonthGridProps) {
  const start = parseISO(`${month}-01`);
  const daysInMonth = getDaysInMonth(start);
  const firstDay = start.getDay(); // Sunday = 0

  const cells: Array<string | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'BUTTON') return;
    const idx = Number(target.dataset.index);
    const isRtl = document.documentElement.dir === 'rtl';
    let next = idx;
    switch (e.key) {
      case 'ArrowRight':
        next = idx + (isRtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = idx + (isRtl ? 1 : -1);
        break;
      case 'ArrowDown':
        next = idx + 7;
        break;
      case 'ArrowUp':
        next = idx - 7;
        break;
      default:
        return;
    }
    let date: string | null | undefined = cells[next];
    while (next >= 0 && next < cells.length && !date) {
      next += e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      date = cells[next];
    }
    if (date) {
      e.preventDefault();
      document.getElementById(`day-${date}`)?.focus();
    }
  };

  return (
    <div
      className="grid grid-cols-7 gap-1 text-center text-sm"
      role="grid"
      aria-label={`חודש ${month}`}
      onKeyDown={handleKeyDown}
    >
      {weekdays.map((w) => (
        <div key={w} className="font-medium py-1" role="columnheader">
          {w}
        </div>
      ))}
      {cells.map((date, idx) =>
        date ? (
          <DayCell
            key={date}
            id={`day-${date}`}
            dataIndex={idx}
            date={date}
            value={entries[date]}
            onChange={onChange}
          />
        ) : (
          <div key={idx} />
        ),
      )}
    </div>
  );
}
