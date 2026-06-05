"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SubjectWithStats } from "@/types";
import { getPercentageColor, getProgressColor } from "@/utils/attendance";

interface SubjectCardProps {
  subject: SubjectWithStats;
  index: number;
  target: number;
}

export function SubjectCard({ subject, index, target }: SubjectCardProps) {
  const { stats, prediction } = subject;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="h-full">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{subject.name}</h3>
              {subject.code && (
                <p className="text-xs text-muted-foreground">{subject.code}</p>
              )}
            </div>
            <Badge variant="secondary">Weight {subject.attendanceWeight}</Badge>
          </div>

          <div className="mb-3 flex items-end justify-between">
            <span
              className={`text-2xl font-bold ${getPercentageColor(stats.percentage, target)}`}
            >
              {stats.percentage.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">
              {stats.attended}/{stats.conducted}
            </span>
          </div>

          <Progress
            value={Math.min(100, stats.percentage)}
            indicatorClassName={getProgressColor(stats.percentage, target)}
            className="mb-4"
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            {prediction.message}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
