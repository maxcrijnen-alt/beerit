import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, toTitleCase } from "@/lib/utils";
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
  const randomBombTimerLabel =
    card.timer_min_seconds && card.timer_max_seconds
      ? `${card.timer_min_seconds}-${card.timer_max_seconds}s bomb timer`
      : "Random bomb timer";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{toTitleCase(card.card_type)}</Badge>
          <Badge variant="outline">{card.intensity}</Badge>
          {card.activity_kind ? (
            <Badge variant="outline">{toTitleCase(card.activity_kind)}</Badge>
          ) : null}
          {card.is_community ? <Badge variant="outline">Community</Badge> : null}
          {card.timer_behavior === "RANDOM_BOMB" ? (
            <Badge variant="outline">{randomBombTimerLabel}</Badge>
          ) : null}
          {card.timer_seconds ? (
            <Badge variant="outline">{card.timer_seconds}s timer</Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <CardTitle className="pt-1 text-base leading-6">{card.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          This round: {card.beerits_value} fictional{" "}
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
