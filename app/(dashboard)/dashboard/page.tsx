import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { OverallCard } from "@/components/dashboard/overall-card";
import { SubjectCard } from "@/components/dashboard/subject-card";
import { WhatIfCalculator } from "@/components/dashboard/what-if-calculator";
import { EmptyState } from "@/components/empty-state";
import { RouteLoading } from "@/components/ui/route-loading";
import { getDashboardDataByUserId } from "@/actions/dashboard";
import { requireAuth } from "@/lib/session";

function DashboardFallback() {
  return <RouteLoading />;
}

async function DashboardContent({ promise }: { promise: Promise<Awaited<ReturnType<typeof getDashboardDataByUserId>>> }) {
  const data = await promise;

  return (
    <>
      <OverallCard
        stats={data.overallStats}
        prediction={data.overallPrediction}
        target={data.settings.targetAttendance}
      />

      <WhatIfCalculator
        stats={data.overallStats}
        target={data.settings.targetAttendance}
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Subject Analytics</h2>
        {data.subjectsWithStats.length === 0 ? (
          <EmptyState
            icon="book-open"
            title="No subjects added"
            description="Add your college subjects to start tracking attendance and get predictions."
            actionLabel="Add Subjects"
            actionHref="/subjects"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.subjectsWithStats.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={index}
                target={data.settings.targetAttendance}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const dataPromise = getDashboardDataByUserId(session.user.id);

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 space-y-8 p-4 lg:p-8">
        <Suspense fallback={<DashboardFallback />}>
          <DashboardContent promise={dataPromise} />
        </Suspense>
      </main>
    </>
  );
}
