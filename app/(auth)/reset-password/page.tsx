"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const form = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully!");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
