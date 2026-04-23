/**
 * Export an array of objects to a CSV file download.
 * All fields are included, null/undefined values become empty strings.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const keys = columns ? columns.map(c => c.key as string) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.join(','),
    ...data.map(row => keys.map(k => escape(row[k])).join(',')),
  ];

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
