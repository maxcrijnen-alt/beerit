import { ExternalLink, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, toTitleCase } from "@/lib/utils";
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
      ? `${card.timer_min_seconds}–${card.timer_max_seconds}s bomb timer`
      : "Random bomb timer";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{toTitleCase(card.card_type)}</Badge>
          <Badge variant="outline">{card.intensity}</Badge>
          {card.activity_kind ? (
            <Badge variant="outline">{toTitleCase(card.activity_kind)}</Badge>
          ) : null}
          {card.is_community ? (
            <Badge variant="outline">Community</Badge>
          ) : null}
          {card.topics?.map((topic) => (
            <Badge
              key={topic.id}
              variant={topic.is_spicy ? "secondary" : "outline"}
            >
              {topic.is_spicy ? (
                <Flame className="mr-0.5 size-3 text-primary" />
              ) : null}
              {topic.title}
            </Badge>
          ))}
          {card.timer_behavior === "RANDOM_BOMB" ? (
            <Badge variant="outline">{randomBombTimerLabel}</Badge>
          ) : null}
          {card.timer_seconds ? (
            <Badge variant="outline">{card.timer_seconds}s timer</Badge>
          ) : null}
          <span className="ml-auto text-xs text-muted-foreground">{label}</span>
        </div>
        <CardTitle className="pt-2 text-lg leading-snug">{card.text}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          This round:{" "}
          <span className="font-semibold">
            {card.beerits_value} fictional{" "}
            {card.beerits_value === 1 ? "Beerit" : "Beerits"}
          </span>
        </p>
        {card.card_type === "ACTIVITY" ? (
          // Open in a new tab so reading the rules never navigates a host out
          // of a live lobby (which would drop their realtime connection).
          <a
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "mt-3 w-full",
            )}
            href={`/games/${card.game_id}`}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
            Read full rules
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
