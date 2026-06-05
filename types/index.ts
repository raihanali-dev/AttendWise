import type { AttendanceStatus } from "@prisma/client";

export type AttendanceStats = {
  attended: number;
  conducted: number;
  percentage: number;
};

export type SubjectWithStats = {
  id: string;
  name: string;
  code: string | null;
  attendanceWeight: number;
  stats: AttendanceStats;
  prediction: PredictionResult;
};

export type PredictionResult = {
  target: number;
  currentPercentage: number;
  classesNeeded: number;
  classesCanSkip: number;
  message: string;
  status: "below" | "at" | "above";
};

export type WhatIfResult = {
  current: number;
  attendAll: number;
  missAll: number;
};

export type AttendanceRecord = {
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

export type MonthlySummary = {
  month: string;
  present: number;
  absent: number;
  noClass: number;
  conducted: number;
  percentage: number;
};

export type TrendPoint = {
  date: string;
  percentage: number;
  conducted: number;
};
