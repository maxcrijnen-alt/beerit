"use client";

import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { EmptyState } from "@/components/empty-state";
import { GameCard } from "@/components/games/game-card";
import { GameFilters } from "@/components/games/game-filters";
import {
  calculateGameScore,
  calculateTrendingScore,
  pickWeightedRandomGame,
} from "@/lib/games/ranking";
import { useGameFiltersStore } from "@/stores/game-filters";
import type { GameSummary } from "@/types/database";

interface GameBrowserProps {
  games: GameSummary[];
}

function weightedRandomOrder(games: GameSummary[]) {
  const remaining = [...games];
  const ordered: GameSummary[] = [];

  while (remaining.length > 0) {
    const picked = pickWeightedRandomGame(remaining);

    if (!picked) {
      break;
    }

    ordered.push(picked);
    remaining.splice(
      remaining.findIndex((game) => game.id === picked.id),
      1,
    );
  }

  return ordered;
}

export function GameBrowser({ games }: GameBrowserProps) {
  const { category, intensity, players, query, randomSeed, sort } =
    useGameFiltersStore();
  const visibleGames = useMemo(() => {
    // A new seed intentionally recalculates the weighted random ordering.
    void randomSeed;
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = games.filter((game) => {
      const matchesPlayers =
        players === null ||
        (game.min_players <= players &&
          (game.max_players === null || game.max_players >= players));

      return (
        (category === "ALL" || game.category === category) &&
        (intensity === "ALL" || game.intensity === intensity) &&
        matchesPlayers &&
        (!normalizedQuery ||
          `${game.title} ${game.description ?? ""} ${game.category} ${game.concept ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery))
      );
    });

    if (sort === "random") {
      return weightedRandomOrder(filtered);
    }

    return [...filtered].sort((a, b) => {
      if (sort === "new") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sort === "liked") {
        return b.likes_count - a.likes_count;
      }

      return calculateTrendingScore(b) - calculateTrendingScore(a);
    });
  }, [category, games, intensity, players, query, randomSeed, sort]);

  return (
    <div className="space-y-4">
      <GameFilters />
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {visibleGames.length} {visibleGames.length === 1 ? "game" : "games"}
        </p>
        <p className="text-xs text-muted-foreground">
          Top score:{" "}
          {visibleGames[0] ? calculateGameScore(visibleGames[0]).toFixed(1) : "-"}
        </p>
      </div>
      {visibleGames.length === 0 ? (
        <EmptyState
          description="Try removing one of your filters or search for a broader term."
          icon={SearchX}
          title="No games match"
        />
      ) : (
        <div className="space-y-3">
          {visibleGames.map((game, index) => (
            <div className="space-y-3" key={game.id}>
              <GameCard game={game} />
              {index === 1 ? <AdPlaceholder /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
