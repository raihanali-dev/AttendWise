"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttendanceStats } from "@/types";
import { calculateWhatIf } from "@/utils/attendance";
import { getPercentageColor } from "@/utils/attendance";

interface WhatIfCalculatorProps {
  stats: AttendanceStats;
  target: number;
}

export function WhatIfCalculator({ stats, target }: WhatIfCalculatorProps) {
  const [futureClasses, setFutureClasses] = useState(10);

  const result = useMemo(
    () => calculateWhatIf(stats, futureClasses),
    [stats, futureClasses]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            What-If Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="future-classes">Number of future classes</Label>
            <Input
              id="future-classes"
              type="number"
              min={0}
              max={500}
              value={futureClasses}
              onChange={(e) => setFutureClasses(Number(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className={`text-2xl font-bold ${getPercentageColor(result.current, target)}`}>
                {result.current.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                If you attend next {futureClasses}
              </p>
              <p className={`text-2xl font-bold ${getPercentageColor(result.attendAll, target)}`}>
                {result.attendAll.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                If you miss next {futureClasses}
              </p>
              <p className={`text-2xl font-bold ${getPercentageColor(result.missAll, target)}`}>
                {result.missAll.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
