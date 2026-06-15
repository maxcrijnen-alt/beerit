import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsiblePlayNoteProps {
  className?: string;
  compact?: boolean;
}

export function ResponsiblePlayNote({
  className,
  compact = false,
}: ResponsiblePlayNoteProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border/80 bg-secondary/70 p-4 text-sm text-muted-foreground shadow-sm",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="leading-5">
        {compact
          ? "Beerits are fictional party points. Play responsibly."
          : "Beerit is a party game platform. Beerits are fictional penalty points and do not require alcohol. Play responsibly and follow local laws."}
      </p>
    </div>
  );
}
