"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import type { AttendanceStats, PredictionResult } from "@/types";

interface OverallCardProps {
  stats: AttendanceStats;
  prediction: PredictionResult;
  target: number;
}

export function OverallCard({ stats, prediction, target }: OverallCardProps) {
  const StatusIcon =
    prediction.status === "above"
      ? TrendingUp
      : prediction.status === "below"
        ? TrendingDown
        : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <ProgressRing
              percentage={stats.percentage}
              target={target}
              size={180}
              strokeWidth={14}
            />
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Overall Attendance</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Target: {target}% · {stats.attended} attended / {stats.conducted} conducted
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground">Total Attended</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.attended}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <p className="text-xs text-muted-foreground">Total Conducted</p>
                  <p className="text-2xl font-bold">{stats.conducted}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-4">
                <StatusIcon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    prediction.status === "above"
                      ? "text-emerald-500"
                      : prediction.status === "below"
                        ? "text-red-500"
                        : "text-amber-500"
                  }`}
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {prediction.message}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
