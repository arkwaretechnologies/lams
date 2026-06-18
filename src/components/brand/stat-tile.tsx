import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTileTone = "maroon" | "gold" | "rose" | "plum";

const TONE_STYLES: Record<StatTileTone, { bubble: string; icon: string }> = {
  maroon: {
    bubble: "bg-primary/10",
    icon: "text-primary",
  },
  gold: {
    bubble: "bg-accent/30",
    icon: "text-amber-800 dark:text-accent",
  },
  rose: {
    bubble: "bg-rose-100 dark:bg-rose-950/50",
    icon: "text-rose-600 dark:text-rose-400",
  },
  plum: {
    bubble: "bg-violet-100 dark:bg-violet-950/50",
    icon: "text-violet-600 dark:text-violet-400",
  },
};

type StatTileProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatTileTone;
  className?: string;
};

export function StatTile({
  title,
  value,
  icon: Icon,
  tone = "maroon",
  className,
}: StatTileProps) {
  const styles = TONE_STYLES[tone];

  return (
    <article
      className={cn(
        "lams-soft-card lams-soft-card-interactive flex items-center gap-4 p-4 sm:p-5",
        className
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          styles.bubble
        )}
      >
        <Icon className={cn("size-5", styles.icon)} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold leading-tight text-foreground">
          {title}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums">{value}</p>
      </div>
    </article>
  );
}
