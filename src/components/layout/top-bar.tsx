import { SyncStatusBadge } from "@/components/layout/sync-status-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GoldRule } from "@/components/brand/gold-rule";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="border-b border-border/40 bg-[oklch(0.955_0.006_90/0.92)] backdrop-blur-sm dark:bg-background/95">
      <div className="flex h-[4.25rem] items-center justify-between px-6 md:px-8">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SyncStatusBadge />
          <ThemeToggle />
        </div>
      </div>
      <GoldRule className="h-px opacity-60" />
    </header>
  );
}
