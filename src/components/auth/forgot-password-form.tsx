"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { GlassAuthInput } from "@/components/auth/glass-auth-input";
import { GlassAuthButton } from "@/components/auth/glass-auth-button";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { z } from "zod";

type ForgotForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(data: ForgotForm) {
    setLoading(true);
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("email", data.email);
    const result = await forgotPasswordAction(formData);
    if (result?.error) setError(result.error);
    if (result?.success) setMessage(result.success);
    setLoading(false);
  }

  if (!mounted) {
    return <AuthFormSkeleton variant="glass" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <GlassAuthInput
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        placeholder="name@letran.edu.ph"
        error={errors.email?.message}
        {...register("email")}
      />
      {error ? (
        <p className="rounded-lg border border-rose-300/25 bg-rose-950/30 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-300/25 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100" role="status">
          {message}
        </p>
      ) : null}
      <GlassAuthButton disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </GlassAuthButton>
      <p className="text-center text-sm text-white/55">
        <Link href="/login" className="auth-glass-link">
          Back to login
        </Link>
      </p>
    </form>
  );
}
