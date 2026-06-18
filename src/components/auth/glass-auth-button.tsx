import { cn } from "@/lib/utils";

type GlassAuthButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function GlassAuthButton({ className, children, ...props }: GlassAuthButtonProps) {
  return (
    <button type="submit" className={cn("auth-glass-button", className)} {...props}>
      {children}
    </button>
  );
}
