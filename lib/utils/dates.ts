export function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseYearMonth(str: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(str);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return { year, month };
}

export function parseYyyymm(str: string): { year: number; month: number } | null {
  const match = /^(\d{4})(0[1-9]|1[0-2])$/.exec(str);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return { year, month };
}

export function isDateInMonth(date: Date, year: number, month: number): boolean {
  const d = normalizeDate(date);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

export function toYyyymm(year: number, month: number): string {
  return `${year}${String(month).padStart(2, '0')}`;
}

