import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { GameCard } from "@/types/database";

interface CurrentGameCardProps {
  card: GameCard;
  label?: string;
}

export function CurrentGameCard({
  card,
  label = `Card ${card.position}`,
}: CurrentGameCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{card.card_type.replaceAll("_", " ")}</Badge>
          <Badge variant="outline">{card.intensity}</Badge>
          {card.activity_kind ? (
            <Badge variant="outline">{card.activity_kind.replaceAll("_", " ")}</Badge>
          ) : null}
          {card.is_community ? <Badge variant="outline">Community</Badge> : null}
          {card.timer_seconds ? (
            <Badge variant="outline">{card.timer_seconds}s timer</Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <CardTitle className="pt-1 text-base leading-6">{card.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Suggested value: {card.beerits_value}{" "}
          {card.beerits_value === 1 ? "Beerit" : "Beerits"}
        </p>
        {card.card_type === "ACTIVITY" ? (
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-3 w-full")}
            href={`/games/${card.game_id}`}
          >
            Read full rules
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
