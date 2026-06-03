import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonCardProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function ComingSoonCard({
  description,
  icon: Icon,
  title,
}: ComingSoonCardProps) {
  return (
    <Card>
      <CardHeader>
        <Icon className="size-5 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
