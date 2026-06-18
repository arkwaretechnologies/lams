"use client";

import { cn } from "@/lib/utils";

type GlassAuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function GlassAuthInput({ label, error, id, className, ...props }: GlassAuthInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-white/90">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "auth-glass-input w-full bg-transparent pb-2 text-base text-white outline-none",
          "placeholder:text-white/35",
          error && "border-b-rose-300/80",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-rose-200/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
