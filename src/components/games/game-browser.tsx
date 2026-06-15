"use client";

import { SearchX, Shuffle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { EmptyState } from "@/components/empty-state";
import { GameCard } from "@/components/games/game-card";
import { GameFilters } from "@/components/games/game-filters";
import { Button } from "@/components/ui/button";
import {
  calculateGameScore,
  calculateTrendingScore,
  type DiscoveryPool,
  pickWeightedRandomGame,
} from "@/lib/games/ranking";
import { useGameFiltersStore } from "@/stores/game-filters";
import type { GameCategory, GameSummary } from "@/types/database";

interface GameBrowserProps {
  games: GameSummary[];
}

const PHYSICAL_GAME_CATEGORIES = new Set<GameCategory>([
  "Card Games",
  "Board Games",
  "Dice Games",
]);

function isPhysicalGame(game: GameSummary) {
  return PHYSICAL_GAME_CATEGORIES.has(game.category);
}

function weightedRandomOrder(games: GameSummary[], pool: DiscoveryPool) {
  const remaining = [...games];
  const ordered: GameSummary[] = [];

  while (remaining.length > 0) {
    const picked = pickWeightedRandomGame(remaining, pool);

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
  const router = useRouter();
  const {
    addRecentRandomGameId,
    category,
    contentMode,
    durationMaxMinutes,
    intensity,
    players,
    pool,
    query,
    randomSeed,
    recentRandomGameIds,
    sort,
  } = useGameFiltersStore();
  const visibleGames = useMemo(() => {
    // A new seed intentionally recalculates the weighted random ordering.
    void randomSeed;
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = games.filter((game) => {
      const isPhysical = isPhysicalGame(game);
      const matchesContentMode =
        contentMode === "BOTH" ||
        (contentMode === "PHYSICAL" && isPhysical) ||
        (contentMode === "DIGITAL" && !isPhysical);
      const matchesDuration =
        durationMaxMinutes === null ||
        (game.estimated_duration !== null &&
          game.estimated_duration <= durationMaxMinutes);
      const matchesPlayers =
        players === null ||
        (game.min_players <= players &&
          (game.max_players === null || game.max_players >= players));

      return (
        (category === "ALL" || game.category === category) &&
        (intensity === "ALL" || game.intensity === intensity) &&
        matchesContentMode &&
        matchesDuration &&
        matchesPlayers &&
        (!normalizedQuery ||
          `${game.title} ${game.description ?? ""} ${game.category} ${game.concept ?? ""}`
            .toLowerCase()
            .includes(normalizedQuery))
      );
    });

    if (sort === "random") {
      return weightedRandomOrder(filtered, pool);
    }

    return [...filtered].sort((a, b) => {
      if (sort === "new") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sort === "liked") {
        return b.likes_count - a.likes_count;
      }

      if (sort === "top") {
        return calculateGameScore(b) - calculateGameScore(a);
      }

      return calculateTrendingScore(b) - calculateTrendingScore(a);
    });
  }, [
    category,
    contentMode,
    durationMaxMinutes,
    games,
    intensity,
    players,
    pool,
    query,
    randomSeed,
    sort,
  ]);
  const freshRandomGames = useMemo(
    () =>
      visibleGames.filter((game) => !recentRandomGameIds.includes(game.id)),
    [recentRandomGameIds, visibleGames],
  );
  const handlePickRandom = useCallback(() => {
    const candidates =
      freshRandomGames.length > 0 ? freshRandomGames : visibleGames;
    const picked = pickWeightedRandomGame(candidates, pool);

    if (!picked) {
      return;
    }

    addRecentRandomGameId(picked.id);
    router.push(`/lobby/create/${picked.id}`);
  }, [
    addRecentRandomGameId,
    freshRandomGames,
    pool,
    router,
    visibleGames,
  ]);

  return (
    <div className="space-y-4">
      <GameFilters />
      <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="font-semibold">Pick a random lobby</h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Uses your filters, avoids recent picks on this device, and still
            sends everyone through lobby setup. No stakes or rewards involved.
          </p>
        </div>
        <Button
          className="w-full"
          disabled={visibleGames.length === 0}
          onClick={handlePickRandom}
        >
          <Shuffle className="size-4" />
          Pick random game
        </Button>
        {freshRandomGames.length === 0 && visibleGames.length > 0 ? (
          <p className="text-xs leading-5 text-muted-foreground">
            All matching games were picked recently, so Beerit may reuse one.
          </p>
        ) : null}
      </section>
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
