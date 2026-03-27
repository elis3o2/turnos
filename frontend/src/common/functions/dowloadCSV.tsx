export function downloadCSVFile<T>({
  data,
  columns,
  filename = "data.csv",
}: {
  data: T[];
  columns: {
    key: string;
    label: string;
    getter: (row: T) => any;
  }[];
  filename?: string;
}) {
  if (!data || data.length === 0) return;

  // headers
  const headers = columns.map(c => c.label);

  // rows
  const rows = data.map(item =>
    columns.map(col => {
      const value = col.getter(item);
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    })
  );

  // csv string
  const csv = [headers, ...rows]
    .map(r => r.join(","))
    .join("\n");

  // download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}