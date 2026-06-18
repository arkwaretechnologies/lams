import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AuthFormSkeletonProps = {
  variant?: "default" | "glass";
};

export function AuthFormSkeleton({ variant = "default" }: AuthFormSkeletonProps) {
  if (variant === "glass") {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-white/15" />
          <Skeleton className="h-8 w-full bg-white/10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 bg-white/15" />
          <Skeleton className="h-8 w-full bg-white/10" />
        </div>
        <Skeleton className="h-12 w-full rounded-full bg-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className={cn("h-11 w-full")} />
    </div>
  );
}
