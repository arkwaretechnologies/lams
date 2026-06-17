"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { Button } from "@/components/ui/button";
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
      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-green-600/20 bg-green-600/5 px-3 py-2 text-sm text-green-700 dark:text-green-400" role="status">
          {message}
        </p>
      )}
      <Button
        type="submit"
        className="h-11 w-full transition-colors duration-200"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
