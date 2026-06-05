import Papa from "papaparse";
import { importRowSchema } from "@/lib/validations";
import type { AttendanceStatus } from "@prisma/client";

export type ImportRow = {
  subject: string;
  date: string;
  status: AttendanceStatus;
  weight?: number;
};

export type ImportValidationResult = {
  valid: boolean;
  rows: ImportRow[];
  errors: string[];
};

function normalizeStatus(status: string): AttendanceStatus | null {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, "_");
  if (normalized === "PRESENT") return "PRESENT";
  if (normalized === "ABSENT") return "ABSENT";
  if (normalized === "NO_CLASS" || normalized === "NOCLASS") return "NO_CLASS";
  return null;
}

function normalizeDate(dateStr: string): string | null {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return null;
}

export function validateImportCSV(content: string): ImportValidationResult {
  const errors: string[] = [];
  const rows: ImportRow[] = [];

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    return {
      valid: false,
      rows: [],
      errors: parsed.errors.map((e) => `Parse error on row ${e.row}: ${e.message}`),
    };
  }

  if (!parsed.data || parsed.data.length === 0) {
    return { valid: false, rows: [], errors: ["CSV file is empty or has no data rows."] };
  }

  parsed.data.forEach((rawRow, index) => {
    const rowNum = index + 2;
    const subject =
      rawRow.Subject ?? rawRow.subject ?? rawRow["Subject Name"] ?? "";
    const date = rawRow.Date ?? rawRow.date ?? "";
    const status = rawRow.Status ?? rawRow.status ?? "";
    const weight = rawRow.Weight ?? rawRow.weight ?? undefined;

    const schemaResult = importRowSchema.safeParse({
      subject,
      date,
      status,
      weight: weight ? Number(weight) : undefined,
    });

    if (!schemaResult.success) {
      errors.push(`Row ${rowNum}: ${schemaResult.error.issues[0]?.message ?? "Invalid data"}`);
      return;
    }

    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) {
      errors.push(`Row ${rowNum}: Invalid date format "${date}"`);
      return;
    }

    const normalizedStatus = normalizeStatus(status);
    if (!normalizedStatus) {
      errors.push(`Row ${rowNum}: Invalid status "${status}". Use Present, Absent, or No Class.`);
      return;
    }

    rows.push({
      subject: subject.trim(),
      date: normalizedDate,
      status: normalizedStatus,
      weight: weight ? Number(weight) : undefined,
    });
  });

  return {
    valid: errors.length === 0,
    rows,
    errors,
  };
}
