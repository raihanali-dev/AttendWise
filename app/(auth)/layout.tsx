import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <Link href="/" className="relative mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AttendWise</h1>
          <p className="text-sm text-muted-foreground">Smart attendance tracking</p>
        </div>
      </Link>

      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
