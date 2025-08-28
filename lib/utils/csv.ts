function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export interface CsvColumn<T> {
  key: keyof T;
  header: string;
}

export function exportToCsv<T extends Record<string, any>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const headerLine = columns.map((c) => escapeCsv(String(c.header))).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] ?? '';
        return escapeCsv(String(val));
      })
      .join(','),
  );
  return '\uFEFF' + [headerLine, ...lines].join('\r\n');
}

