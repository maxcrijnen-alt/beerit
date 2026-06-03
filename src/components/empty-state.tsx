import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function EmptyState({
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-5 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <h2 className="mt-4 font-semibold">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
