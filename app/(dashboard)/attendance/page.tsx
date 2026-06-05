import { Header } from "@/components/layout/header";
import { AttendanceMarking } from "@/components/attendance/attendance-marking";
import { EmptyState } from "@/components/empty-state";
import { getSubjects } from "@/actions/subjects";
import { getAttendanceForDate } from "@/actions/attendance";
import { formatDateKey } from "@/lib/utils";

interface AttendancePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const dateKey = params.date ?? formatDateKey(new Date());

  const [subjects, attendanceData] = await Promise.all([
    getSubjects(),
    getAttendanceForDate(dateKey),
  ]);

  const initialStatuses = Object.fromEntries(
    attendanceData.map((item) => [item.subject.id, item.status])
  );

  return (
    <>
      <Header title="Mark Attendance" />
      <main className="flex-1 p-4 lg:p-8">
        {subjects.length === 0 ? (
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
        )}
      </main>
    </>
  );
}
