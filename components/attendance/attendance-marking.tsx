"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { AttendanceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateKey } from "@/lib/utils";
import { markAttendance, bulkMarkAttendance, resetDay } from "@/actions/attendance";
import { toast } from "sonner";

type SubjectItem = {
  id: string;
  name: string;
  code: string | null;
  attendanceWeight: number;
};

interface AttendanceMarkingProps {
  subjects: SubjectItem[];
  initialDate: string;
  initialStatuses: Record<string, AttendanceStatus>;
}

const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "PRESENT", label: "Present", color: "bg-emerald-600 hover:bg-emerald-700" },
  { value: "ABSENT", label: "Absent", color: "bg-red-600 hover:bg-red-700" },
  { value: "NO_CLASS", label: "No Class", color: "bg-zinc-500 hover:bg-zinc-600" },
];

export function AttendanceMarking({
  subjects,
  initialDate,
  initialStatuses,
}: AttendanceMarkingProps) {
  const [date, setDate] = useState(initialDate);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(initialStatuses);
  const [isPending, startTransition] = useTransition();

  const currentDate = new Date(date + "T00:00:00");

  const handleStatusChange = (subjectId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [subjectId]: status }));
    startTransition(async () => {
      const result = await markAttendance({ subjectId, date, status });
      if (!result.success) {
        toast.error(result.error ?? "Failed to save");
      }
    });
  };

  const handleBulk = (status: AttendanceStatus) => {
    const newStatuses = Object.fromEntries(subjects.map((s) => [s.id, status]));
    setStatuses(newStatuses);
    startTransition(async () => {
      const result = await bulkMarkAttendance({ date, status });
      if (result.success) {
        toast.success(`Marked all as ${status.replace("_", " ").toLowerCase()}`);
      } else {
        toast.error(result.error ?? "Failed to bulk update");
      }
    });
  };

  const handleReset = () => {
    const newStatuses = Object.fromEntries(subjects.map((s) => [s.id, "NO_CLASS" as AttendanceStatus]));
    setStatuses(newStatuses);
    startTransition(async () => {
      const result = await resetDay(date);
      if (result.success) {
        toast.success("Day reset");
      } else {
        toast.error("Failed to reset");
      }
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1);
    const key = formatDateKey(newDate);
    window.location.href = `/attendance?date=${key}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] text-center">
            <p className="text-lg font-semibold">{format(currentDate, "EEEE")}</p>
            <p className="text-sm text-muted-foreground">{format(currentDate, "MMMM d, yyyy")}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="success" size="sm" onClick={() => handleBulk("PRESENT")} disabled={isPending}>
            Mark All Present
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleBulk("ABSENT")} disabled={isPending}>
            Mark All Absent
          </Button>
          <Button variant="muted" size="sm" onClick={() => handleBulk("NO_CLASS")} disabled={isPending}>
            Mark All No Class
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isPending}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset Day
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{subject.name}</h3>
                    {subject.code && (
                      <p className="text-xs text-muted-foreground">{subject.code}</p>
                    )}
                  </div>
                  <Badge variant="secondary">×{subject.attendanceWeight}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(subject.id, option.value)}
                      className={cn(
                        "rounded-xl px-2 py-2.5 text-xs font-medium text-white transition-all",
                        option.color,
                        statuses[subject.id] === option.value
                          ? "ring-2 ring-offset-2 ring-offset-background ring-white/50 scale-105"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
