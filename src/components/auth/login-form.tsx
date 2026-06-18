"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/schemas";
import { loginAction } from "@/lib/actions/auth";
import { GlassAuthInput } from "@/components/auth/glass-auth-input";
import { GlassAuthButton } from "@/components/auth/glass-auth-button";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { z } from "zod";

const REMEMBER_KEY = "lams_remember_email";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setValue("email", saved);
        setRemember(true);
      }
    } catch {
      // private browsing
    }
  }, [setValue]);

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, data.email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        // ignore
      }
    }
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
      <GlassAuthInput
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between gap-4 pt-1">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/75 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="auth-glass-checkbox"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="auth-glass-link text-sm">
          Forgot password?
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-300/25 bg-rose-950/30 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <GlassAuthButton disabled={loading}>
        {loading ? "Signing in..." : "Log In"}
      </GlassAuthButton>
    </form>
  );
}
