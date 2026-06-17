"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type AuthInputProps = React.ComponentProps<typeof Input> & {
  label: string;
  icon: LucideIcon;
  error?: string;
};

export function AuthInput({ label, icon: Icon, error, id, className, ...props }: AuthInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          className={cn(
            "h-11 pl-10 transition-colors duration-200",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
