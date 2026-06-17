import { cn } from "@/lib/utils";

type DataLabelProps = React.ComponentProps<"span">;

export function DataLabel({ className, ...props }: DataLabelProps) {
  return (
    <span
      className={cn("font-data text-[0.9em] tracking-tight", className)}
      {...props}
    />
  );
}
