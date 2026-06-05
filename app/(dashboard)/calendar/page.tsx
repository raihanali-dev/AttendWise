import { Header } from "@/components/layout/header";
import { AttendanceCalendar } from "@/components/calendar/attendance-calendar";
import { getCalendarData } from "@/actions/attendance";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth();

  const calendarData = await getCalendarData(year, month);

  return (
    <>
      <Header title="Calendar" />
      <main className="flex-1 p-4 lg:p-8">
        <AttendanceCalendar year={year} month={month} calendarData={calendarData} />
      </main>
    </>
  );
}
