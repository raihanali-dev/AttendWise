"use client";

import { motion } from "framer-motion";
import { BookOpen, ClipboardList, History, BarChart3, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type EmptyStateIcon = "book-open" | "clipboard-list" | "history" | "bar-chart";

const iconMap: Record<EmptyStateIcon, LucideIcon> = {
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  history: History,
  "bar-chart": BarChart3,
};

interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const Icon = iconMap[icon];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 px-6 py-16 text-center backdrop-blur-sm"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}
