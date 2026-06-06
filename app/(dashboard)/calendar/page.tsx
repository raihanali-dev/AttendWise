import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { AttendanceCalendar } from "@/components/calendar/attendance-calendar";
import { RouteLoading } from "@/components/ui/route-loading";
import { getCalendarDataByUserId } from "@/actions/attendance";
import { requireAuth } from "@/lib/session";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

async function CalendarContent({
  year,
  month,
  calendarPromise,
}: {
  year: number;
  month: number;
  calendarPromise: ReturnType<typeof getCalendarDataByUserId>;
}) {
  const calendarData = await calendarPromise;
  return <AttendanceCalendar year={year} month={month} calendarData={calendarData} />;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await requireAuth();
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth();

  const calendarPromise = getCalendarDataByUserId(session.user.id, year, month);

  return (
    <>
      <Header title="Calendar" />
      <main className="flex-1 p-4 lg:p-8">
        <Suspense fallback={<RouteLoading />}>
          <CalendarContent year={year} month={month} calendarPromise={calendarPromise} />
        </Suspense>
      </main>
    </>
  );
}
