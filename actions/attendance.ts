"use server";

import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import {
  attendanceMarkSchema,
  bulkAttendanceSchema,
  historyFilterSchema,
} from "@/lib/validations";
import { parseDateKey } from "@/lib/utils";

const REVALIDATE_PATHS = [
  "/dashboard",
  "/attendance",
  "/calendar",
  "/history",
  "/analytics",
];

function revalidateAll() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export async function getAttendanceForDateByUserId(userId: string, dateKey: string) {
  const date = parseDateKey(dateKey);

  const [subjects, entries] = await Promise.all([
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
        date,
      },
      select: {
        subjectId: true,
        status: true,
      },
    }),
  ]);

  const entryMap = new Map(entries.map((e) => [e.subjectId, e]));

  return subjects.map((subject) => {
    const entry = entryMap.get(subject.id);
    return {
      subject,
      entry: entry ?? null,
      status: (entry?.status ?? "NO_CLASS") as AttendanceStatus,
    };
  });
}

export async function getAttendanceForDate(dateKey: string) {
  const session = await requireAuth();
  return getAttendanceForDateByUserId(session.user.id, dateKey);
}

export async function markAttendance(data: unknown) {
  const session = await requireAuth();
  const parsed = attendanceMarkSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, userId: session.user.id },
  });
  if (!subject) {
    return { success: false, error: "Subject not found" };
  }

  const date = parseDateKey(parsed.data.date);
  const weightUsed = subject.attendanceWeight;

  const entry = await prisma.attendanceEntry.upsert({
    where: {
      userId_subjectId_date: {
        userId: session.user.id,
        subjectId: subject.id,
        date,
      },
    },
    create: {
      userId: session.user.id,
      subjectId: subject.id,
      date,
      status: parsed.data.status,
      weightUsed,
    },
    update: {
      status: parsed.data.status,
      weightUsed,
    },
  });

  revalidateAll();
  return { success: true, data: entry };
}

export async function bulkMarkAttendance(data: unknown) {
  const session = await requireAuth();
  const parsed = bulkAttendanceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
  });

  if (subjects.length === 0) {
    return { success: false, error: "No subjects found" };
  }

  const date = parseDateKey(parsed.data.date);

  await prisma.$transaction(
    subjects.map((subject) =>
      prisma.attendanceEntry.upsert({
        where: {
          userId_subjectId_date: {
            userId: session.user.id,
            subjectId: subject.id,
            date,
          },
        },
        create: {
          userId: session.user.id,
          subjectId: subject.id,
          date,
          status: parsed.data.status,
          weightUsed: subject.attendanceWeight,
        },
        update: {
          status: parsed.data.status,
          weightUsed: subject.attendanceWeight,
        },
      })
    )
  );

  revalidateAll();
  return { success: true };
}

export async function resetDay(dateKey: string) {
  const session = await requireAuth();
  const date = parseDateKey(dateKey);

  await prisma.attendanceEntry.deleteMany({
    where: { userId: session.user.id, date },
  });

  revalidateAll();
  return { success: true };
}

export async function getAttendanceHistoryByUserId(userId: string, filters: unknown) {
  const parsed = historyFilterSchema.safeParse(filters);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  const { subjectId, startDate, endDate, page, pageSize } = parsed.data;

  const where: {
    userId: string;
    subjectId?: string;
    date?: { gte?: Date; lte?: Date };
    status?: { not: "NO_CLASS" };
  } = {
    userId,
    status: { not: "NO_CLASS" },
  };

  if (subjectId) where.subjectId = subjectId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = parseDateKey(startDate);
    if (endDate) where.date.lte = parseDateKey(endDate);
  }

  const [total, records] = await Promise.all([
    prisma.attendanceEntry.count({ where }),
    prisma.attendanceEntry.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, code: true, attendanceWeight: true },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAttendanceHistory(filters: unknown) {
  const session = await requireAuth();
  return getAttendanceHistoryByUserId(session.user.id, filters);
}

export async function updateAttendanceEntry(id: string, status: AttendanceStatus) {
  const session = await requireAuth();

  const entry = await prisma.attendanceEntry.findFirst({
    where: { id, userId: session.user.id },
    include: { subject: true },
  });
  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  const updated = await prisma.attendanceEntry.update({
    where: { id },
    data: {
      status,
      weightUsed: entry.subject.attendanceWeight,
    },
  });

  revalidateAll();
  return { success: true, data: updated };
}

export async function deleteAttendanceEntry(id: string) {
  const session = await requireAuth();

  const entry = await prisma.attendanceEntry.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!entry) {
    return { success: false, error: "Entry not found" };
  }

  await prisma.attendanceEntry.delete({ where: { id } });

  revalidateAll();
  return { success: true };
}

export async function getCalendarDataByUserId(userId: string, year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const entries = await prisma.attendanceEntry.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      status: { not: "NO_CLASS" },
    },
    select: {
      date: true,
      status: true,
    },
    orderBy: { date: "asc" },
  });

  const dayMap = new Map<
    string,
    { present: number; absent: number; noClass: number; entries: typeof entries }
  >();

  for (const entry of entries) {
    const key = entry.date.toISOString().split("T")[0];
    if (!dayMap.has(key)) {
      dayMap.set(key, { present: 0, absent: 0, noClass: 0, entries: [] });
    }
    const day = dayMap.get(key)!;
    day.entries.push(entry);
    if (entry.status === "PRESENT") day.present++;
    else if (entry.status === "ABSENT") day.absent++;
    else day.noClass++;
  }

  return Object.fromEntries(dayMap);
}

export async function getCalendarData(year: number, month: number) {
  const session = await requireAuth();
  return getCalendarDataByUserId(session.user.id, year, month);
}

export async function getAllAttendanceForExport() {
  const session = await requireAuth();

  return prisma.attendanceEntry.findMany({
    where: {
      userId: session.user.id,
      status: { not: "NO_CLASS" },
    },
    include: {
      subject: {
        select: { id: true, name: true, code: true, attendanceWeight: true },
      },
    },
    orderBy: [{ date: "desc" }, { subject: { name: "asc" } }],
  });
}
