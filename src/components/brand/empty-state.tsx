import Image from "next/image";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center",
        className
      )}
    >
      <Image
        src="/brand/lams-mark.svg"
        alt=""
        width={48}
        height={48}
        className="mb-4 opacity-20"
        aria-hidden="true"
      />
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
