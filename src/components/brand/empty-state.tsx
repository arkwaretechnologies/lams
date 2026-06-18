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
        "flex flex-col items-center justify-center rounded-2xl bg-muted/30 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Image
          src="/brand/lams-mark.svg"
          alt=""
          width={28}
          height={28}
          className="opacity-40"
          aria-hidden="true"
        />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
