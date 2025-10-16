// src/utils/csv.ts
export function toCSV(rows: Array<Record<string, any>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
    };
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h])).join(',')),
  ].join('\n');
}
