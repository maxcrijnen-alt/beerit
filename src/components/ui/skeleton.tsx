import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-secondary/80 motion-reduce:animate-none",
        className,
      )}
    />
  );
}
