import { formatCurrency, formatTime } from "@/lib/utils/date";
import type { TodayConsumptionItem } from "@/lib/consumption/today-history";
import { cn } from "@/lib/utils";

type ConsumptionTodayHistoryProps = {
  items: TodayConsumptionItem[];
  loading?: boolean;
  className?: string;
};

export function ConsumptionTodayHistory({
  items,
  loading,
  className,
}: ConsumptionTodayHistoryProps) {
  if (!loading && items.length === 0) return null;

  return (
    <div className={cn("lams-soft-card overflow-hidden", className)}>
      <div className="border-b border-border/40 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Consumed today
        </p>
        {!loading && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {items.length} transaction{items.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 px-4 py-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : (
        <ul className="max-h-44 divide-y divide-border/40 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium tabular-nums text-foreground">
                  {formatCurrency(item.amount)}
                </p>
                {item.remarks ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.remarks}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(item.transactionTime)}
                </p>
                {item.pending ? (
                  <p className="mt-0.5 text-[0.65rem] font-medium text-amber-700 dark:text-amber-400">
                    Pending sync
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
