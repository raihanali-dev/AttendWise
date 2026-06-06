import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/empty-state";
import { RouteLoading } from "@/components/ui/route-loading";
import { AnalyticsChartsShell } from "@/components/analytics/analytics-charts-shell";
import { getAnalyticsDataByUserId } from "@/actions/dashboard";
import { requireAuth } from "@/lib/session";

async function AnalyticsContent({ promise }: { promise: Promise<Awaited<ReturnType<typeof getAnalyticsDataByUserId>>> }) {
  const data = await promise;

  return data.totalEntries === 0 ? (
    <EmptyState
      icon="bar-chart"
      title="No analytics available"
      description="Record some attendance to unlock charts, trends, and monthly summaries."
      actionLabel="Mark Attendance"
      actionHref="/attendance"
    />
  ) : (
    <AnalyticsChartsShell
      presentCount={data.presentCount}
      absentCount={data.absentCount}
      subjectBarData={data.subjectBarData}
      trendData={data.trendData}
      monthlySummaries={data.monthlySummaries}
      target={data.settings.targetAttendance}
    />
  );
}

export default async function AnalyticsPage() {
  const session = await requireAuth();
  const analyticsPromise = getAnalyticsDataByUserId(session.user.id);

  return (
    <>
      <Header title="Analytics" />
      <main className="flex-1 p-4 lg:p-8">
        <Suspense fallback={<RouteLoading />}>
          <AnalyticsContent promise={analyticsPromise} />
        </Suspense>
      </main>
    </>
  );
}
