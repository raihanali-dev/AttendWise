import { Header } from "@/components/layout/header";
import { OverallCard } from "@/components/dashboard/overall-card";
import { SubjectCard } from "@/components/dashboard/subject-card";
import { WhatIfCalculator } from "@/components/dashboard/what-if-calculator";
import { EmptyState } from "@/components/empty-state";
import { getDashboardData } from "@/actions/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 space-y-8 p-4 lg:p-8">
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
      </main>
    </>
  );
}
