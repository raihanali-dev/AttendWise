import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { AttendanceMarking } from "@/components/attendance/attendance-marking";
import { EmptyState } from "@/components/empty-state";
import { RouteLoading } from "@/components/ui/route-loading";
import { getSubjectsByUserId } from "@/actions/subjects";
import { getAttendanceForDateByUserId } from "@/actions/attendance";
import { formatDateKey } from "@/lib/utils";
import { requireAuth } from "@/lib/session";

interface AttendancePageProps {
  searchParams: Promise<{ date?: string }>;
}

async function AttendanceContent({
  dateKey,
  subjectsPromise,
  attendancePromise,
}: {
  dateKey: string;
  subjectsPromise: ReturnType<typeof getSubjectsByUserId>;
  attendancePromise: ReturnType<typeof getAttendanceForDateByUserId>;
}) {
  const [subjects, attendanceData] = await Promise.all([
    subjectsPromise,
    attendancePromise,
  ]);

  const initialStatuses = Object.fromEntries(
    attendanceData.map((item) => [item.subject.id, item.status])
  );

  return subjects.length === 0 ? (
    <EmptyState
      icon="clipboard-list"
      title="No subjects to mark"
      description="Add subjects first, then come back to mark your daily attendance."
      actionLabel="Add Subjects"
      actionHref="/subjects"
    />
  ) : (
    <AttendanceMarking
      subjects={subjects}
      initialDate={dateKey}
      initialStatuses={initialStatuses}
    />
  );
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await requireAuth();
  const params = await searchParams;
  const dateKey = params.date ?? formatDateKey(new Date());

  const subjectsPromise = getSubjectsByUserId(session.user.id);
  const attendancePromise = getAttendanceForDateByUserId(session.user.id, dateKey);

  return (
    <>
      <Header title="Mark Attendance" />
      <main className="flex-1 p-4 lg:p-8">
        <Suspense fallback={<RouteLoading />}>
          <AttendanceContent
            dateKey={dateKey}
            subjectsPromise={subjectsPromise}
            attendancePromise={attendancePromise}
          />
        </Suspense>
      </main>
    </>
  );
}
