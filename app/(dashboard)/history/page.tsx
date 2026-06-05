import { Header } from "@/components/layout/header";
import { HistoryTable } from "@/components/history/history-table";
import { EmptyState } from "@/components/empty-state";
import { getAttendanceHistory } from "@/actions/attendance";
import { getSubjects } from "@/actions/subjects";

interface HistoryPageProps {
  searchParams: Promise<{
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;

  const [history, subjects] = await Promise.all([
    getAttendanceHistory({
      subjectId: params.subjectId,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page ? parseInt(params.page) : 1,
      pageSize: 20,
    }),
    getSubjects(),
  ]);

  return (
    <>
      <Header title="Attendance History" />
      <main className="flex-1 p-4 lg:p-8">
        {history.total === 0 ? (
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
        )}
      </main>
    </>
  );
}
