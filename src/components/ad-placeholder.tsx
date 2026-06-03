import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  className?: string;
  label?: string;
}

export function AdPlaceholder({
  className,
  label = "Future native ad placement",
}: AdPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground",
        className,
      )}
    >
      <Megaphone className="size-4 shrink-0 text-primary" />
      <span>{label}. No ads are active in this MVP.</span>
    </div>
  );
}
