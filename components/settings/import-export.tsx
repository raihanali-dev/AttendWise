"use client";

import { useState, useRef } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllAttendanceForExport } from "@/actions/attendance";
import { importAttendanceData } from "@/actions/settings";
import { exportToCSV, exportToExcel, downloadBlob } from "@/utils/export";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ImportExport() {
  const [loading, setLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const records = await getAllAttendanceForExport();
      if (records.length === 0) {
        toast.error("No attendance data to export");
        return;
      }
      const csv = exportToCSV(records);
      downloadBlob(csv, `attendwise-export-${Date.now()}.csv`, "text/csv");
      toast.success("CSV exported successfully");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const records = await getAllAttendanceForExport();
      if (records.length === 0) {
        toast.error("No attendance data to export");
        return;
      }
      const buffer = exportToExcel(records);
      downloadBlob(buffer, `attendwise-export-${Date.now()}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      toast.success("Excel exported successfully");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportErrors([]);

    try {
      const content = await file.text();
      const result = await importAttendanceData(content);

      if (result.success) {
        toast.success(`Imported ${result.imported} records`);
        router.refresh();
      } else {
        setImportErrors(result.errors);
        toast.error(`Import failed with ${result.errors.length} error(s)`);
      }
    } catch {
      toast.error("Failed to read file");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import & Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportCSV} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={loading}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">CSV Format</p>
          <p className="mt-1">
            Required columns: Subject, Date (YYYY-MM-DD), Status (Present/Absent/No Class), Weight (optional)
          </p>
        </div>

        {importErrors.length > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="mb-2 text-sm font-medium text-red-500">Import Errors</p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-red-400">
              {importErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
