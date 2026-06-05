"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlySummary } from "@/types";

const PIE_COLORS = ["#10b981", "#ef4444"];

interface AnalyticsChartsProps {
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

export function AnalyticsCharts({
  presentCount,
  absentCount,
  subjectBarData,
  trendData,
  monthlySummaries,
  target,
}: AnalyticsChartsProps) {
  const pieData = [
    { name: "Present", value: presentCount },
    { name: "Absent", value: absentCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Present vs Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBarData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Attendance"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Monthly Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monthlySummaries.map((summary) => (
            <Card key={summary.month}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">{summary.month}</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    summary.percentage >= target
                      ? "text-emerald-500"
                      : summary.percentage >= target - 10
                        ? "text-amber-500"
                        : "text-red-500"
                  }`}
                >
                  {summary.percentage.toFixed(1)}%
                </p>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span className="text-emerald-500">{summary.present} present</span>
                  <span className="text-red-500">{summary.absent} absent</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
