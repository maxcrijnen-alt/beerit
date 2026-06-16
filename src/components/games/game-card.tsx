import {
  Clock3,
  Heart,
  Layers,
  Play,
  ThumbsDown,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GameSummary } from "@/types/database";

interface GameCardProps {
  game: GameSummary;
}

export function GameCard({ game }: GameCardProps) {
  const playerRange = game.max_players
    ? `${game.min_players}–${game.max_players}`
    : `${game.min_players}+`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{game.category}</Badge>
          <Badge variant="outline">{game.intensity}</Badge>
        </div>
        <CardTitle className="pt-1 text-lg leading-snug">{game.title}</CardTitle>
        {game.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {game.description}
          </p>
        ) : null}
        {game.concept ? (
          <p className="text-xs text-primary">Concept: {game.concept}</p>
        ) : null}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UsersRound className="size-3.5 text-primary" />
            {playerRange}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5 text-primary" />
            {game.estimated_duration ?? "?"} min
          </span>
          <span className="flex items-center gap-1.5">
            <Play className="size-3.5 text-primary" />
            {game.plays_count} plays
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" />
            {game.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="size-3.5" />
            {game.dislikes_count}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="size-3.5" />
            {game.cards_count}
          </span>
          <span className="ml-auto">
            by {game.creator_username ? `@${game.creator_username}` : "Beerit"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
          href={`/games/${game.id}`}
        >
          View details
        </Link>
        <Link
          className={cn(buttonVariants({ size: "sm" }), "flex-[2]")}
          href={`/lobby/create/${game.id}`}
        >
          <Play className="size-3.5" />
          Play
        </Link>
      </CardFooter>
    </Card>
  );
}
