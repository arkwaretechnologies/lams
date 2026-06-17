"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
import { loginAction } from "@/lib/actions/auth";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { Button } from "@/components/ui/button";
import { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  if (!mounted) {
    return <AuthFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AuthInput
        label="Email"
        icon={Mail}
        id="email"
        type="email"
        autoComplete="email"
        placeholder="name@letran.edu.ph"
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthInput
        label="Password"
        icon={Lock}
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />
      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="h-11 w-full transition-colors duration-200"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
