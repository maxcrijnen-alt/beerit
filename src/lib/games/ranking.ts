import type { GameSummary } from "@/types/database";

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

export function pickWeightedRandomGame(games: GameSummary[]) {
  if (games.length === 0) {
    return null;
  }

  const weighted = games.map((game) => ({
    game,
    weight: Math.max(1, calculateGameScore(game) + 10),
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
