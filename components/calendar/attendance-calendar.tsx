"use client";

import { useState, useTransition } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateKey } from "@/lib/utils";

type DayData = {
  present: number;
  absent: number;
  noClass: number;
};

interface AttendanceCalendarProps {
  year: number;
  month: number;
  calendarData: Record<string, DayData>;
}

export function AttendanceCalendar({ year, month, calendarData }: AttendanceCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(year, month, 1));
  const [, startTransition] = useTransition();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = direction === "prev" ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    startTransition(() => {
      router.push(`/calendar?year=${newMonth.getFullYear()}&month=${newMonth.getMonth()}`);
    });
  };

  const getDayColor = (dateKey: string) => {
    const data = calendarData[dateKey];
    if (!data) return "bg-muted/30";
    if (data.present > 0 && data.absent === 0) return "bg-emerald-500/80 text-white";
    if (data.absent > 0 && data.present === 0) return "bg-red-500/80 text-white";
    if (data.present > 0 && data.absent > 0) return "bg-amber-500/80 text-white";
    return "bg-zinc-400/50 dark:bg-zinc-600/50";
  };

  const handleDayClick = (day: Date) => {
    const key = formatDateKey(day);
    router.push(`/attendance?date=${key}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const key = formatDateKey(day);
            const data = calendarData[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-xl text-sm font-medium transition-all hover:scale-105 hover:ring-2 hover:ring-primary/50",
                  getDayColor(key),
                  isToday(day) && "ring-2 ring-primary",
                  !isSameMonth(day, currentMonth) && "opacity-30"
                )}
              >
                <span>{format(day, "d")}</span>
                {data && (
                  <div className="mt-0.5 text-[10px] opacity-80">
                    {data.present > 0 && <span>P{data.present}</span>}
                    {data.absent > 0 && <span> A{data.absent}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            Present
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            Absent
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-zinc-400" />
            No Class
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
