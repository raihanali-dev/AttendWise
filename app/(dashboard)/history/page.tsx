import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { HistoryTable } from "@/components/history/history-table";
import { EmptyState } from "@/components/empty-state";
import { RouteLoading } from "@/components/ui/route-loading";
import { getAttendanceHistoryByUserId } from "@/actions/attendance";
import { getSubjectsByUserId } from "@/actions/subjects";
import { requireAuth } from "@/lib/session";

interface HistoryPageProps {
  searchParams: Promise<{
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

async function HistoryContent({
  historyPromise,
  subjectsPromise,
}: {
  historyPromise: ReturnType<typeof getAttendanceHistoryByUserId>;
  subjectsPromise: ReturnType<typeof getSubjectsByUserId>;
}) {
  const [history, subjects] = await Promise.all([historyPromise, subjectsPromise]);

  return history.total === 0 ? (
    <EmptyState
      icon="history"
      title="No attendance recorded"
      description="Start marking your daily attendance to build your history."
      actionLabel="Mark Attendance"
      actionHref="/attendance"
    />
  ) : (
    <HistoryTable
      initialRecords={history.records}
      subjects={subjects}
      initialTotal={history.total}
      initialPage={history.page}
      pageSize={history.pageSize}
      totalPages={history.totalPages}
    />
  );
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await requireAuth();
  const params = await searchParams;

  const historyPromise = getAttendanceHistoryByUserId(session.user.id, {
    subjectId: params.subjectId,
    startDate: params.startDate,
    endDate: params.endDate,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 20,
  });
  const subjectsPromise = getSubjectsByUserId(session.user.id);

  return (
    <>
      <Header title="Attendance History" />
      <main className="flex-1 p-4 lg:p-8">
        <Suspense fallback={<RouteLoading />}>
          <HistoryContent historyPromise={historyPromise} subjectsPromise={subjectsPromise} />
        </Suspense>
      </main>
    </>
  );
}
