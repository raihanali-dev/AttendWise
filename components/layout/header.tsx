"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header({ title }: { title: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight lg:text-xl">{title}</h1>
        {session?.user && (
          <p className="text-xs text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
