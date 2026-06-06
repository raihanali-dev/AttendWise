"use server";

import { prisma } from "@/lib/prisma";
import { getUserSettingsByUserId } from "@/actions/settings";
import {
  calculateStatsFromEntries,
  calculatePrediction,
} from "@/utils/attendance";
import type { SubjectWithStats, MonthlySummary, TrendPoint } from "@/types";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export async function getDashboardDataByUserId(userId: string) {
  const [settings, subjects, entries] = await Promise.all([
    getUserSettingsByUserId(userId),
    prisma.subject.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        code: true,
        attendanceWeight: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attendanceEntry.findMany({
      where: {
        userId,
        status: { not: "NO_CLASS" },
      },
      select: {
        subjectId: true,
        status: true,
        weightUsed: true,
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const overallStats = calculateStatsFromEntries(
    entries.map((e) => ({ status: e.status, weightUsed: e.weightUsed }))
  );

  const overallPrediction = calculatePrediction(overallStats, settings.targetAttendance);

  const entriesBySubject = entries.reduce((map, entry) => {
    const bucket = map.get(entry.subjectId) ?? [];
    bucket.push(entry);
    map.set(entry.subjectId, bucket);
    return map;
  }, new Map<string, typeof entries>());

  const subjectsWithStats: SubjectWithStats[] = subjects.map((subject) => {
    const subjectEntries = entriesBySubject.get(subject.id) ?? [];
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

  return {
    settings,
    overallStats,
    overallPrediction,
    subjectsWithStats,
    totalSubjects: subjects.length,
    totalEntries: entries.length,
  };
}

export async function getAnalyticsDataByUserId(userId: string) {
  const [settings, entries, subjects] = await Promise.all([
    getUserSettingsByUserId(userId),
    prisma.attendanceEntry.findMany({
      where: {
        userId,
        status: { not: "NO_CLASS" },
      },
      select: {
        subjectId: true,
        status: true,
        weightUsed: true,
        date: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.subject.findMany({
      where: { userId },
      select: { id: true, name: true, code: true, attendanceWeight: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const presentCount = entries.filter((e) => e.status === "PRESENT").length;
  const absentCount = entries.filter((e) => e.status === "ABSENT").length;

  const entriesBySubject = entries.reduce((map, entry) => {
    const bucket = map.get(entry.subjectId) ?? [];
    bucket.push(entry);
    map.set(entry.subjectId, bucket);
    return map;
  }, new Map<string, typeof entries>());

  const subjectBarData = subjects.map((subject) => {
    const subjectEntries = entriesBySubject.get(subject.id) ?? [];
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
