import * as XLSX from "xlsx";
import type { AttendanceRecord } from "@/types";
import { getStatusLabel } from "@/utils/attendance";
import { calculateStatsFromEntries } from "@/utils/attendance";

export type ExportRow = {
  Subject: string;
  "Subject Code": string;
  Date: string;
  Status: string;
  Weight: number;
  "Subject %": string;
};

function formatExportRows(records: AttendanceRecord[]): ExportRow[] {
  const subjectEntries = new Map<string, AttendanceRecord[]>();

  for (const record of records) {
    const key = record.subject.id;
    if (!subjectEntries.has(key)) {
      subjectEntries.set(key, []);
    }
    subjectEntries.get(key)!.push(record);
  }

  const subjectPercentages = new Map<string, string>();
  for (const [subjectId, entries] of subjectEntries) {
    const stats = calculateStatsFromEntries(
      entries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
    );
    subjectPercentages.set(subjectId, `${stats.percentage.toFixed(2)}%`);
  }

  return records.map((record) => ({
    Subject: record.subject.name,
    "Subject Code": record.subject.code ?? "",
    Date: new Date(record.date).toISOString().split("T")[0],
    Status: getStatusLabel(record.status),
    Weight: record.weightUsed,
    "Subject %": subjectPercentages.get(record.subject.id) ?? "0.00%",
  }));
}

export function exportToCSV(records: AttendanceRecord[]): string {
  const rows = formatExportRows(records);
  const headers = Object.keys(rows[0] ?? {
    Subject: "",
    "Subject Code": "",
    Date: "",
    Status: "",
    Weight: 0,
    "Subject %": "",
  });

  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof ExportRow];
          const str = String(value);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    ),
  ];

  return csvLines.join("\n");
}

export function exportToExcel(records: AttendanceRecord[]): ArrayBuffer {
  const rows = formatExportRows(records);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
