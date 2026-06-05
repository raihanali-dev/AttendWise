import { Header } from "@/components/layout/header";
import { AnalyticsCharts } from "@/components/analytics/charts";
import { EmptyState } from "@/components/empty-state";
import { getAnalyticsData } from "@/actions/dashboard";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <>
      <Header title="Analytics" />
      <main className="flex-1 p-4 lg:p-8">
        {data.totalEntries === 0 ? (
          <EmptyState
            icon="bar-chart"
            title="No analytics available"
            description="Record some attendance to unlock charts, trends, and monthly summaries."
            actionLabel="Mark Attendance"
            actionHref="/attendance"
          />
        ) : (
          <AnalyticsCharts
            presentCount={data.presentCount}
            absentCount={data.absentCount}
            subjectBarData={data.subjectBarData}
            trendData={data.trendData}
            monthlySummaries={data.monthlySummaries}
            target={data.settings.targetAttendance}
          />
        )}
      </main>
    </>
  );
}
