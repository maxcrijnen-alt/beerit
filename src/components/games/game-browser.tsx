"use client";

import { SearchX, Shuffle } from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pickRandomGameAction } from "@/app/browse/actions";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { EmptyState } from "@/components/empty-state";
import { GameCard } from "@/components/games/game-card";
import { GameFilters } from "@/components/games/game-filters";
import { Button } from "@/components/ui/button";
import {
  calculateGameScore,
  calculateTrendingScore,
  pickWeightedRandomGame,
} from "@/lib/games/ranking";
import { isPhysicalCategory } from "@/lib/games/categories";
import { buildRandomLobbyCreateHref } from "@/lib/lobbies/defaults";
import { logDevelopmentError } from "@/lib/dev-log";
import { useGameFiltersStore } from "@/stores/game-filters";
import { GAME_CATEGORIES, GAME_INTENSITIES } from "@/types/database";
import type { DiscoveryPool, GameSummary } from "@/types/database";

interface GameBrowserProps {
  games: GameSummary[];
}

function isPhysicalGame(game: GameSummary) {
  return isPhysicalCategory(game.category);
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
  const searchParams = useSearchParams();
  const hasAppliedRandomIntent = useRef(false);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [randomMessage, setRandomMessage] = useState<string | null>(null);
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
    setCategory,
    setDurationMaxMinutes,
    setIntensity,
    setPool,
    setSort,
    sort,
  } = useGameFiltersStore();
  useEffect(() => {
    if (
      hasAppliedRandomIntent.current ||
      searchParams.get("intent") !== "random"
    ) {
      return;
    }

    hasAppliedRandomIntent.current = true;
    setPool("SURPRISE");
    setSort("random");
  }, [searchParams, setPool, setSort]);
  const hasAppliedQuickFilters = useRef(false);
  useEffect(() => {
    if (hasAppliedQuickFilters.current) {
      return;
    }

    const maxDuration = searchParams.get("maxDuration");
    const intensityParam = searchParams.get("intensity");
    const categoryParam = searchParams.get("category");

    if (!maxDuration && !intensityParam && !categoryParam) {
      return;
    }

    hasAppliedQuickFilters.current = true;

    if (maxDuration) {
      const parsed = Number(maxDuration);

      if (!Number.isNaN(parsed)) {
        setDurationMaxMinutes(parsed);
      }
    }

    if (intensityParam) {
      const isValid = (
        v: string,
      ): v is (typeof GAME_INTENSITIES)[number] | "ALL" =>
        (["ALL", ...GAME_INTENSITIES] as string[]).includes(v);

      if (isValid(intensityParam)) {
        setIntensity(intensityParam);
      }
    }

    if (categoryParam) {
      const isValid = (v: string): v is (typeof GAME_CATEGORIES)[number] =>
        (GAME_CATEGORIES as readonly string[]).includes(v);

      if (isValid(categoryParam)) {
        setCategory(categoryParam);
      }
    }
  }, [searchParams, setCategory, setDurationMaxMinutes, setIntensity]);

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
  const pickLocalRandomGame = useCallback(() => {
    const candidates =
      freshRandomGames.length > 0 ? freshRandomGames : visibleGames;

    return pickWeightedRandomGame(candidates, pool);
  }, [freshRandomGames, pool, visibleGames]);
  const pushRandomLobby = useCallback(
    (game: Pick<GameSummary, "category" | "id">) => {
      addRecentRandomGameId(game.id);
      router.push(
        buildRandomLobbyCreateHref({
          categoryFilter: category,
          contentMode,
          game,
        }),
      );
    },
    [addRecentRandomGameId, category, contentMode, router],
  );
  const handlePickRandom = useCallback(() => {
    setIsPickingRandom(true);
    setRandomMessage(null);

    startTransition(async () => {
      try {
        const result = await pickRandomGameAction({
          category,
          contentMode,
          durationMaxMinutes,
          intensity,
          players,
          pool,
          query,
          recentRandomGameIds,
        });

        if (result.status === "success" && result.gameId) {
          const pickedGame = games.find((game) => game.id === result.gameId);

          if (pickedGame) {
            pushRandomLobby(pickedGame);
            return;
          }

          addRecentRandomGameId(result.gameId);
          router.push(`/lobby/create/${result.gameId}?fromRandom=1`);
          return;
        }

        const picked = pickLocalRandomGame();

        if (!picked) {
          setRandomMessage(result.message);
          return;
        }

        setRandomMessage(result.message);
        pushRandomLobby(picked);
      } catch (error) {
        logDevelopmentError("Could not pick a random game.", error);
        const picked = pickLocalRandomGame();

        if (!picked) {
          setRandomMessage("Could not pick a random game. Try fewer filters.");
          return;
        }

        pushRandomLobby(picked);
      } finally {
        setIsPickingRandom(false);
      }
    });
  }, [
    addRecentRandomGameId,
    category,
    contentMode,
    durationMaxMinutes,
    games,
    intensity,
    pickLocalRandomGame,
    players,
    pool,
    pushRandomLobby,
    query,
    recentRandomGameIds,
    router,
  ]);


  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-[0_16px_45px_rgba(48,34,18,0.08)]">
        <div className="absolute -right-12 -top-14 size-36 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative space-y-3">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shuffle className="size-4" />
              </span>
              Pick a random lobby
            </h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Uses your filters, avoids recent picks on this device, and still
              sends everyone through lobby setup. No stakes or rewards involved.
            </p>
          </div>
          <Button
            className="w-full"
            disabled={visibleGames.length === 0 || isPickingRandom}
            onClick={handlePickRandom}
          >
            <Shuffle className="size-4" />
            {isPickingRandom ? "Picking..." : "Pick random game"}
          </Button>
          {randomMessage ? (
            <p
              aria-live="polite"
              className="text-xs leading-5 text-muted-foreground"
            >
              {randomMessage}
            </p>
          ) : null}
          {freshRandomGames.length === 0 && visibleGames.length > 0 ? (
            <p className="text-xs leading-5 text-muted-foreground">
              All matching games were picked recently, so Beerit may reuse one.
            </p>
          ) : null}
        </div>
      </section>
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
