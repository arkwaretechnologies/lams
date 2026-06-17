import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LamsCardProps = React.ComponentProps<typeof Card> & {
  variant?: "default" | "ops";
  goldRule?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
};

export function LamsCard({
  variant = "default",
  goldRule = true,
  title,
  description,
  footer,
  headerAction,
  className,
  children,
  ...props
}: LamsCardProps) {
  return (
    <Card
      className={cn(
        "ring-0 shadow-(--shadow-card)",
        goldRule && "lams-gold-rule-top",
        variant === "ops" && "border-primary/15 bg-card",
        variant === "default" && "border-border/80",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            {title && (
              <CardTitle className="font-display text-lg font-semibold tracking-tight">
                {title}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction}
        </CardHeader>
      )}
      {children && <CardContent className={!title && !description ? "pt-5" : undefined}>{children}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
