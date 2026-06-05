"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getUserSettings } from "@/actions/settings";
import {
  calculateStatsFromEntries,
  calculatePrediction,
} from "@/utils/attendance";
import type { SubjectWithStats, MonthlySummary, TrendPoint } from "@/types";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export async function getDashboardData() {
  const session = await requireAuth();
  const settings = await getUserSettings();

  const [subjects, entries] = await Promise.all([
    prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attendanceEntry.findMany({
      where: {
        userId: session.user.id,
        status: { not: "NO_CLASS" },
      },
      include: { subject: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const overallStats = calculateStatsFromEntries(
    entries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
  );

  const overallPrediction = calculatePrediction(overallStats, settings.targetAttendance);

  const subjectsWithStats: SubjectWithStats[] = subjects.map((subject) => {
    const subjectEntries = entries.filter((e) => e.subjectId === subject.id);
    const stats = calculateStatsFromEntries(
      subjectEntries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
    );
    const prediction = calculatePrediction(stats, settings.targetAttendance);

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      attendanceWeight: subject.attendanceWeight,
      stats,
      prediction,
    };
  });

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;

  return {
    settings,
    overallStats,
    overallPrediction,
    subjectsWithStats,
    presentCount,
    absentCount,
    totalSubjects: subjects.length,
    totalEntries: entries.length,
  };
}

export async function getAnalyticsData() {
  const session = await requireAuth();
  const settings = await getUserSettings();

  const entries = await prisma.attendanceEntry.findMany({
    where: {
      userId: session.user.id,
      status: { not: "NO_CLASS" },
    },
    include: { subject: true },
    orderBy: { date: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
  });

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;

  const subjectBarData = subjects.map((subject) => {
    const subjectEntries = entries.filter((e) => e.subjectId === subject.id);
    const stats = calculateStatsFromEntries(
      subjectEntries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
    );
    return {
      name: subject.code ?? subject.name,
      fullName: subject.name,
      percentage: Number(stats.percentage.toFixed(2)),
      attended: stats.attended,
      conducted: stats.conducted,
    };
  });

  const trendMap = new Map<string, { attended: number; conducted: number }>();
  for (const entry of entries) {
    const key = format(new Date(entry.date), "yyyy-MM-dd");
    if (!trendMap.has(key)) {
      trendMap.set(key, { attended: 0, conducted: 0 });
    }
    const day = trendMap.get(key)!;
    if (entry.status === "PRESENT") {
      day.attended += entry.weightUsed;
      day.conducted += entry.weightUsed;
    } else if (entry.status === "ABSENT") {
      day.conducted += entry.weightUsed;
    }
  }

  let cumulativeAttended = 0;
  let cumulativeConducted = 0;
  const trendData: TrendPoint[] = [];

  const sortedDates = Array.from(trendMap.keys()).sort();
  for (const date of sortedDates) {
    const day = trendMap.get(date)!;
    cumulativeAttended += day.attended;
    cumulativeConducted += day.conducted;
    trendData.push({
      date: format(new Date(date), "MMM dd"),
      percentage:
        cumulativeConducted > 0
          ? Number(((cumulativeAttended / cumulativeConducted) * 100).toFixed(2))
          : 0,
      conducted: cumulativeConducted,
    });
  }

  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

  const monthlySummaries: MonthlySummary[] = months.map((monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= monthStart && d <= monthEnd;
    });

    const present = monthEntries.filter((e) => e.status === "PRESENT").length;
    const absent = monthEntries.filter((e) => e.status === "ABSENT").length;
    const stats = calculateStatsFromEntries(
      monthEntries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
    );

    return {
      month: format(monthDate, "MMM yyyy"),
      present,
      absent,
      noClass: 0,
      conducted: stats.conducted,
      percentage: Number(stats.percentage.toFixed(2)),
    };
  });

  const overallStats = calculateStatsFromEntries(
    entries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
  );

  return {
    settings,
    presentCount,
    absentCount,
    subjectBarData,
    trendData,
    monthlySummaries,
    overallStats,
    totalEntries: entries.length,
  };
}
