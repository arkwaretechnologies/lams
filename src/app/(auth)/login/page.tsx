import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with your staff credentials to access the meal management dashboard."
    >
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </AuthShell>
  );
}
