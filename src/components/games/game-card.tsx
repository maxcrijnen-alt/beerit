import {
  Clock3,
  Heart,
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
  CardDescription,
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
    ? `${game.min_players}-${game.max_players}`
    : `${game.min_players}+`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{game.category}</Badge>
          <Badge variant="outline">{game.intensity}</Badge>
        </div>
        <CardTitle className="pt-1">{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
        {game.concept ? (
          <p className="text-xs text-primary">Concept: {game.concept}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          by {game.creator_username ? `@${game.creator_username}` : "Beerit"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
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
            {game.plays_count}
          </span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" />
            {game.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="size-3.5" />
            {game.dislikes_count}
          </span>
          <span>{game.cards_count} cards</span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          href={`/games/${game.id}`}
        >
          Details
        </Link>
        <Link
          className={cn(buttonVariants(), "w-full")}
          href={`/lobby/create/${game.id}`}
        >
          Start
        </Link>
      </CardFooter>
    </Card>
  );
}
