import { cn } from "@/lib/utils";

type GoldRuleProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export function GoldRule({ className, orientation = "horizontal" }: GoldRuleProps) {
  return (
    <div
      role="presentation"
      className={cn(
        orientation === "horizontal"
          ? "h-0.5 w-full bg-accent"
          : "h-full w-0.5 bg-accent",
        className
      )}
    />
  );
}
