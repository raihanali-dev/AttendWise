"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { settingsSchema } from "@/lib/validations";
import { validateImportCSV } from "@/utils/import";
import { parseDateKey } from "@/lib/utils";
import type { AttendanceStatus } from "@prisma/client";

export async function getUserSettings() {
  const session = await requireAuth();

  let settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: session.user.id },
    });
  }

  return settings;
}

export async function updateUserSettings(data: unknown) {
  const session = await requireAuth();
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      targetAttendance: parsed.data.targetAttendance,
      darkModePreference: parsed.data.darkModePreference,
    },
    update: {
      targetAttendance: parsed.data.targetAttendance,
      darkModePreference: parsed.data.darkModePreference,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/analytics");
  return { success: true, data: settings };
}

export async function importAttendanceData(csvContent: string) {
  const session = await requireAuth();
  const validation = validateImportCSV(csvContent);

  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
  });

  const subjectMap = new Map(
    subjects.map((s) => [s.name.toLowerCase(), s])
  );

  const errors: string[] = [];
  let imported = 0;

  for (const row of validation.rows) {
    let subject = subjectMap.get(row.subject.toLowerCase());

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          userId: session.user.id,
          name: row.subject,
          attendanceWeight: row.weight ?? 1,
        },
      });
      subjectMap.set(row.subject.toLowerCase(), subject);
    }

    const date = parseDateKey(row.date);
    const weightUsed = row.weight ?? subject.attendanceWeight;

    try {
      await prisma.attendanceEntry.upsert({
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
          status: row.status as AttendanceStatus,
          weightUsed,
        },
        update: {
          status: row.status as AttendanceStatus,
          weightUsed,
        },
      });
      imported++;
    } catch {
      errors.push(`Failed to import entry for ${row.subject} on ${row.date}`);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  revalidatePath("/history");
  revalidatePath("/analytics");
  revalidatePath("/calendar");

  return {
    success: errors.length === 0,
    imported,
    errors,
  };
}
