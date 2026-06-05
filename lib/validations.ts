import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  code: z.string().max(20).optional().nullable(),
  attendanceWeight: z.number().int().min(1, "Weight must be at least 1").max(10, "Weight cannot exceed 10"),
});

export const attendanceMarkSchema = z.object({
  subjectId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["PRESENT", "ABSENT", "NO_CLASS"]),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["PRESENT", "ABSENT", "NO_CLASS"]),
});

export const settingsSchema = z.object({
  targetAttendance: z.number().min(1, "Target must be at least 1%").max(100, "Target cannot exceed 100%"),
  darkModePreference: z.enum(["light", "dark", "system"]),
});

export const whatIfSchema = z.object({
  futureClasses: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .pipe(z.number().int().min(0).max(500)),
});

export const historyFilterSchema = z.object({
  subjectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === undefined ? 1 : Number(val)))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === undefined ? 20 : Number(val)))
    .pipe(z.number().int().min(1).max(100)),
});

export const importRowSchema = z.object({
  subject: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["Present", "Absent", "No Class", "PRESENT", "ABSENT", "NO_CLASS"]),
  weight: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val === undefined ? undefined : Number(val)))
    .pipe(z.number().int().min(1).max(10).optional()),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type AttendanceMarkInput = z.infer<typeof attendanceMarkSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
