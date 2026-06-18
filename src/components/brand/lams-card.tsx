import { cn } from "@/lib/utils";

type LamsCardProps = React.ComponentProps<"div"> & {
  variant?: "default" | "ops";
  goldRule?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
};

export function LamsCard({
  variant = "default",
  goldRule = false,
  title,
  description,
  footer,
  headerAction,
  className,
  children,
  ...props
}: LamsCardProps) {
  return (
    <div
      className={cn(
        "lams-soft-card",
        goldRule && "border-t-[3px] border-t-accent",
        variant === "ops" && "border-primary/10",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="flex flex-row items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold leading-tight text-foreground">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      {children && (
        <div className={cn("px-5 pb-5", !title && !description && "pt-5")}>{children}</div>
      )}
      {footer && (
        <div className="border-t border-border/40 bg-muted/20 px-5 py-4">{footer}</div>
      )}
    </div>
  );
}
