"use client";

import { Suspense, lazy } from "react";
import { RouteLoading } from "@/components/ui/route-loading";
import type { MonthlySummary } from "@/types";

const AnalyticsCharts = lazy(async () => {
  const mod = await import("./charts");
  return { default: mod.AnalyticsCharts };
});

interface AnalyticsChartsShellProps {
  presentCount: number;
  absentCount: number;
  subjectBarData: {
    name: string;
    fullName: string;
    percentage: number;
    attended: number;
    conducted: number;
  }[];
  trendData: { date: string; percentage: number; conducted: number }[];
  monthlySummaries: MonthlySummary[];
  target: number;
}

export function AnalyticsChartsShell(props: AnalyticsChartsShellProps) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <AnalyticsCharts {...props} />
    </Suspense>
  );
}
