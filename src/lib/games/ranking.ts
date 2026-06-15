import type { DiscoveryPool, GameSummary } from "@/types/database";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function calculateGameScore(
  game: Pick<
    GameSummary,
    "dislikes_count" | "likes_count" | "plays_count" | "reports_count"
  >,
) {
  return (
    game.likes_count -
    game.dislikes_count +
    game.plays_count * 0.2 -
    game.reports_count * 3
  );
}

export function calculateTrendingScore(
  game: Pick<
    GameSummary,
    | "created_at"
    | "dislikes_count"
    | "likes_count"
    | "plays_count"
    | "reports_count"
  >,
) {
  const ageInDays = Math.max(
    0,
    (Date.now() - new Date(game.created_at).getTime()) / DAY_IN_MS,
  );
  const recencyMultiplier = Math.max(0.1, 1 - ageInDays / 30);
  const recentActivityApproximation =
    game.plays_count * recencyMultiplier * 2 +
    game.likes_count * recencyMultiplier * 3;

  return calculateGameScore(game) + recentActivityApproximation;
}

function calculateAgeInDays(createdAt: string) {
  return Math.max(0, (Date.now() - new Date(createdAt).getTime()) / DAY_IN_MS);
}

export function calculateDiscoveryWeight(
  game: Pick<
    GameSummary,
    | "created_at"
    | "dislikes_count"
    | "likes_count"
    | "plays_count"
    | "reports_count"
  >,
  pool: DiscoveryPool = "TOP",
) {
  const ageInDays = calculateAgeInDays(game.created_at);
  const newBoost = Math.max(0, 5 - ageInDays * 0.25);
  const safeTopWeight =
    10 +
    game.likes_count * 3 +
    Math.min(game.plays_count, 100) * 0.25 +
    newBoost -
    game.dislikes_count * 4 -
    game.reports_count * 8;
  const heavilyDisliked =
    game.dislikes_count >= 10 && game.dislikes_count > game.likes_count * 2;

  if (heavilyDisliked) {
    return 0.25;
  }

  if (pool === "HOT") {
    return Math.max(1, calculateTrendingScore(game) + 10);
  }

  if (pool === "RECENT") {
    return Math.max(
      1,
      10 + newBoost * 3 + game.likes_count - game.dislikes_count * 4,
    );
  }

  if (pool === "MOST_LIKED") {
    return Math.max(
      1,
      10 + game.likes_count * 5 - game.dislikes_count * 3 - game.reports_count * 8,
    );
  }

  if (pool === "SURPRISE") {
    return Math.max(1, Math.sqrt(Math.max(1, safeTopWeight)) + 3);
  }

  return Math.max(1, safeTopWeight);
}

export function pickWeightedRandomGame(
  games: GameSummary[],
  pool: DiscoveryPool = "TOP",
) {
  if (games.length === 0) {
    return null;
  }

  const weighted = games.map((game) => ({
    game,
    weight: calculateDiscoveryWeight(game, pool),
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;

  for (const item of weighted) {
    cursor -= item.weight;

    if (cursor <= 0) {
      return item.game;
    }
  }

  return weighted[weighted.length - 1].game;
}
