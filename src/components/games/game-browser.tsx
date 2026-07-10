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
import { RandomFilterSheet } from "@/components/games/random-filter-sheet";
import { Button } from "@/components/ui/button";
import {
  calculateGameScore,
  calculateTrendingScore,
  pickWeightedRandomGame,
} from "@/lib/games/ranking";
import { buildRandomLobbyCreateHref } from "@/lib/lobbies/defaults";
import { logDevelopmentError } from "@/lib/dev-log";
import { useGameFiltersStore } from "@/stores/game-filters";
import type {
  DiscoveryPool,
  GameCategory,
  GameSummary,
  GameVoteType,
} from "@/types/database";
import { GAME_CATEGORIES, GAME_INTENSITIES } from "@/types/database";

interface GameBrowserProps {
  canVote?: boolean;
  games: GameSummary[];
  viewerVotes?: Record<string, GameVoteType>;
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

export function GameBrowser({
  canVote = false,
  games,
  viewerVotes = {},
}: GameBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAppliedRandomIntent = useRef(false);
  const [isPickingRandom, setIsPickingRandom] = useState(false);
  const [randomMessage, setRandomMessage] = useState<string | null>(null);
  const [randomSheetOpen, setRandomSheetOpen] = useState(false);
  const {
    addRecentRandomGameId,
    category,
    contentMode,
    durationMaxMinutes,
    intensity,
    players,
    pool,
    query,
    randomCategories,
    randomIntensities,
    randomSeed,
    recentRandomGameIds,
    setPool,
    setRandomCategories,
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
    setRandomSheetOpen(true);
  }, [searchParams, setPool, setSort]);

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
  const pushRandomLobby = useCallback(
    (game: Pick<GameSummary, "category" | "id">, pickedPool?: DiscoveryPool) => {
      addRecentRandomGameId(game.id);
      router.push(
        buildRandomLobbyCreateHref({
          categoryFilter: category,
          contentMode,
          game,
          pool: pickedPool,
        }),
      );
    },
    [addRecentRandomGameId, category, contentMode, router],
  );
  const handlePickRandom = useCallback((options?: { surprise: boolean }) => {
    const surprise = options?.surprise ?? false;

    if (surprise) {
      setRandomCategories([...GAME_CATEGORIES]);
      setPool("SURPRISE");
    }

    // Surprise widens everything except the vibe: Spicy/Chaos stay an
    // explicit opt-in and are never re-enabled behind the group's back.
    const pickPool = surprise ? "SURPRISE" : pool;
    const pickCategories = surprise ? [] : randomCategories;
    const pickIntensities = randomIntensities;
    const pickContentMode = surprise ? "BOTH" : contentMode;
    const pickPlayers = surprise ? null : players;
    const pickDuration = surprise ? null : durationMaxMinutes;
    const localCandidates = games.filter((game) => {
      const isPhysical = isPhysicalGame(game);
      const matchesContentMode =
        pickContentMode === "BOTH" ||
        (pickContentMode === "PHYSICAL" && isPhysical) ||
        (pickContentMode === "DIGITAL" && !isPhysical);
      const matchesDuration =
        pickDuration === null ||
        (game.estimated_duration !== null &&
          game.estimated_duration <= pickDuration);
      const matchesPlayers =
        pickPlayers === null ||
        (game.min_players <= pickPlayers &&
          (game.max_players === null || game.max_players >= pickPlayers));

      return (
        (pickCategories.length === 0 ||
          pickCategories.includes(game.category)) &&
        (pickIntensities.length === 0 ||
          pickIntensities.includes(game.intensity)) &&
        matchesContentMode &&
        matchesDuration &&
        matchesPlayers
      );
    });
    const pickLocalCandidate = () => {
      const fresh = localCandidates.filter(
        (game) => !recentRandomGameIds.includes(game.id),
      );

      return pickWeightedRandomGame(
        fresh.length > 0 ? fresh : localCandidates,
        pickPool,
      );
    };

    setRandomSheetOpen(false);
    setIsPickingRandom(true);
    setRandomMessage(null);

    startTransition(async () => {
      try {
        const result = await pickRandomGameAction({
          categories:
            pickCategories.length === GAME_CATEGORIES.length
              ? undefined
              : pickCategories.length > 0
                ? pickCategories
                : undefined,
          category: surprise ? "ALL" : category,
          contentMode: pickContentMode,
          durationMaxMinutes: pickDuration,
          intensities:
            pickIntensities.length === GAME_INTENSITIES.length
              ? undefined
              : pickIntensities.length > 0
                ? pickIntensities
                : undefined,
          intensity: surprise ? "ALL" : intensity,
          players: pickPlayers,
          pool: pickPool,
          query: surprise ? "" : query,
          recentRandomGameIds,
        });

        if (result.status === "success" && result.gameId) {
          const pickedGame = games.find((game) => game.id === result.gameId);

          if (pickedGame) {
            pushRandomLobby(pickedGame, pickPool);
            return;
          }

          addRecentRandomGameId(result.gameId);
          router.push(`/lobby/create/${result.gameId}?fromRandom=1`);
          return;
        }

        const picked = pickLocalCandidate();

        if (!picked) {
          setRandomMessage(result.message);
          return;
        }

        setRandomMessage(result.message);
        pushRandomLobby(picked, pickPool);
      } catch (error) {
        logDevelopmentError("Could not pick a random game.", error);
        const picked = pickLocalCandidate();

        if (!picked) {
          setRandomMessage("Could not pick a random game. Try fewer filters.");
          return;
        }

        pushRandomLobby(picked, pickPool);
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
    players,
    pool,
    pushRandomLobby,
    query,
    randomCategories,
    randomIntensities,
    recentRandomGameIds,
    router,
    setPool,
    setRandomCategories,
  ]);


  return (
    <div className="space-y-4">
      <GameFilters />
      <section className="relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
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
            disabled={isPickingRandom}
            onClick={() => setRandomSheetOpen(true)}
          >
            <Shuffle className="size-4" />
            {isPickingRandom ? "Picking..." : "Random from filters"}
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
              <GameCard
                canVote={canVote}
                game={game}
                initialVote={viewerVotes[game.id] ?? null}
              />
              {index === 1 ? <AdPlaceholder /> : null}
            </div>
          ))}
        </div>
      )}
      <RandomFilterSheet
        onOpenChange={setRandomSheetOpen}
        onStart={handlePickRandom}
        open={randomSheetOpen}
        pending={isPickingRandom}
      />
    </div>
  );
}
