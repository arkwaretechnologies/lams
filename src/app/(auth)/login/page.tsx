import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell formVariant="glass">
      <h1 className="auth-glass-title">Login</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
