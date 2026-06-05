"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import type { AttendanceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusLabel } from "@/utils/attendance";
import { updateAttendanceEntry, deleteAttendanceEntry } from "@/actions/attendance";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type HistoryRecord = {
  id: string;
  date: Date;
  status: AttendanceStatus;
  weightUsed: number;
  subject: {
    id: string;
    name: string;
    code: string | null;
    attendanceWeight: number;
  };
};

interface HistoryTableProps {
  initialRecords: HistoryRecord[];
  subjects: { id: string; name: string }[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  totalPages: number;
}

export function HistoryTable({
  initialRecords,
  subjects,
  initialTotal,
  initialPage,
  pageSize,
  totalPages,
}: HistoryTableProps) {
  const [records, setRecords] = useState(initialRecords);
  const [isPending, startTransition] = useTransition();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    startTransition(async () => {
      const result = await updateAttendanceEntry(id, status);
      if (result.success) {
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        toast.success("Updated");
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAttendanceEntry(id);
      if (result.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        toast.success("Deleted");
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (subjectFilter !== "all") params.set("subjectId", subjectFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    window.location.href = `/history?${params.toString()}`;
  };

  const statusVariant = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "success" as const;
      case "ABSENT":
        return "danger" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium">{record.subject.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(record.date), "MMM d, yyyy")} · Weight {record.weightUsed}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
                <Select
                  value={record.status}
                  onValueChange={(v) => handleStatusChange(record.id, v as AttendanceStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="NO_CLASS">No Class</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(record.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {records.length} of {initialTotal} records
        </span>
        <div className="flex gap-2">
          {initialPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/history?page=${initialPage - 1}`}>Previous</a>
            </Button>
          )}
          {initialPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/history?page=${initialPage + 1}`}>Next</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
