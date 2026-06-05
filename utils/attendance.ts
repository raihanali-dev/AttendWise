import type { AttendanceStatus } from "@prisma/client";
import type { AttendanceStats, PredictionResult, WhatIfResult } from "@/types";

type EntryLike = {
  status: AttendanceStatus;
  weightUsed: number;
};

export function calculateStatsFromEntries(entries: EntryLike[]): AttendanceStats {
  let attended = 0;
  let conducted = 0;

  for (const entry of entries) {
    const weight = entry.weightUsed;
    if (entry.status === "PRESENT") {
      attended += weight;
      conducted += weight;
    } else if (entry.status === "ABSENT") {
      conducted += weight;
    }
  }

  const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;

  return { attended, conducted, percentage };
}

export function calculatePrediction(
  stats: AttendanceStats,
  target: number
): PredictionResult {
  const { attended, conducted, percentage } = stats;
  const currentPercentage = conducted > 0 ? percentage : 0;

  if (conducted === 0) {
    return {
      target,
      currentPercentage: 0,
      classesNeeded: 0,
      classesCanSkip: 0,
      message: "No classes recorded yet. Start marking attendance to get predictions.",
      status: "below",
    };
  }

  if (currentPercentage >= target) {
    const maxSkips = Math.floor(attended / target - conducted);
    const classesCanSkip = Math.max(0, maxSkips);

    return {
      target,
      currentPercentage,
      classesNeeded: 0,
      classesCanSkip,
      message:
        classesCanSkip > 0
          ? `You may safely skip ${classesCanSkip} class${classesCanSkip === 1 ? "" : "es"} and remain above target.`
          : "You are at your target. No classes can be safely skipped.",
      status: currentPercentage === target ? "at" : "above",
    };
  }

  const classesNeeded = Math.ceil(
    (target * conducted - 100 * attended) / (100 - target)
  );

  return {
    target,
    currentPercentage,
    classesNeeded: Math.max(0, classesNeeded),
    classesCanSkip: 0,
    message: `You need to attend ${Math.max(0, classesNeeded)} more class${classesNeeded === 1 ? "" : "es"} continuously to reach your target.`,
    status: "below",
  };
}

export function calculateWhatIf(
  stats: AttendanceStats,
  futureClasses: number,
  unitWeight = 1
): WhatIfResult {
  const current = stats.conducted > 0 ? stats.percentage : 0;

  if (futureClasses <= 0) {
    return { current, attendAll: current, missAll: current };
  }

  const attendAllConducted = stats.conducted + futureClasses * unitWeight;
  const attendAllAttended = stats.attended + futureClasses * unitWeight;
  const attendAll =
    attendAllConducted > 0 ? (attendAllAttended / attendAllConducted) * 100 : 0;

  const missAllConducted = stats.conducted + futureClasses * unitWeight;
  const missAllAttended = stats.attended;
  const missAll =
    missAllConducted > 0 ? (missAllAttended / missAllConducted) * 100 : 0;

  return { current, attendAll, missAll };
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "NO_CLASS":
      return "No Class";
    default:
      return status;
  }
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-500";
    case "ABSENT":
      return "bg-red-500";
    case "NO_CLASS":
      return "bg-zinc-400 dark:bg-zinc-600";
    default:
      return "bg-zinc-400";
  }
}

export function getPercentageColor(percentage: number, target = 75): string {
  if (percentage >= target) return "text-emerald-500";
  if (percentage >= target - 10) return "text-amber-500";
  return "text-red-500";
}

export function getProgressColor(percentage: number, target = 75): string {
  if (percentage >= target) return "bg-emerald-500";
  if (percentage >= target - 10) return "bg-amber-500";
  return "bg-red-500";
}
