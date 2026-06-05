"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp, requestPasswordReset } from "@/lib/auth-client";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    setLoading(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Invalid credentials");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your AttendWise account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@college.edu" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Start tracking your attendance today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@college.edu" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      const result = await requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to send reset email");
        return;
      }

      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@college.edu" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
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
