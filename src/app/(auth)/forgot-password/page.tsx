import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell formVariant="glass">
      <h1 className="auth-glass-title">Reset Password</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-white/55">
        Enter your staff email and we&apos;ll send a secure reset link.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
