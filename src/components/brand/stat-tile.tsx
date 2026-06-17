import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type StatTileProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
};

export function StatTile({ title, value, icon: Icon, className }: StatTileProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/80 shadow-(--shadow-card) ring-0 lams-gold-rule-top",
        className
      )}
    >
      <CardContent className="flex items-start justify-between pt-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full border border-accent/40 bg-accent/15">
          <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
