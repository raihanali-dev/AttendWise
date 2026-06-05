"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getPercentageColor } from "@/utils/attendance";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  target?: number;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  target = 75,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercentage / 100) * circumference;

  const color =
    percentage >= target
      ? "stroke-emerald-500"
      : percentage >= target - 10
        ? "stroke-amber-500"
        : "stroke-red-500";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("text-3xl font-bold tracking-tight", getPercentageColor(percentage, target))}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {percentage.toFixed(2)}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Overall</span>
      </div>
    </div>
  );
}
