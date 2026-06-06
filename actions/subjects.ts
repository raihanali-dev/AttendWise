"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { subjectSchema } from "@/lib/validations";

export async function getSubjectsByUserId(userId: string) {
  return prisma.subject.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      code: true,
      attendanceWeight: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSubjects() {
  const session = await requireAuth();
  return getSubjectsByUserId(session.user.id);
}

export async function createSubject(data: unknown) {
  const session = await requireAuth();
  const parsed = subjectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const subject = await prisma.subject.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      code: parsed.data.code || null,
      attendanceWeight: parsed.data.attendanceWeight,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/attendance");
  return { success: true, data: subject };
}

export async function updateSubject(id: string, data: unknown) {
  const session = await requireAuth();
  const parsed = subjectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const existing = await prisma.subject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return { success: false, error: "Subject not found" };
  }

  const subject = await prisma.subject.update({
    where: { id },
    data: {
      name: parsed.data.name,
      code: parsed.data.code || null,
      attendanceWeight: parsed.data.attendanceWeight,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/attendance");
  return { success: true, data: subject };
}

export async function deleteSubject(id: string) {
  const session = await requireAuth();

  const existing = await prisma.subject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return { success: false, error: "Subject not found" };
  }

  await prisma.subject.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/attendance");
  revalidatePath("/history");
  revalidatePath("/analytics");
  return { success: true };
}
