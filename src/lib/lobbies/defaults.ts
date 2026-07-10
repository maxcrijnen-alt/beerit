import type {
  DiscoveryContentMode,
  DiscoveryPool,
  GameActivityKind,
  GameCategory,
  GameSummary,
  LobbyActivitySelectionMode,
} from "@/types/database";
import {
  DISCOVERY_POOLS,
  GAME_ACTIVITY_KINDS,
  GAME_CATEGORIES,
} from "@/types/database";

export interface LobbyCreateDefaults {
  activityKinds: GameActivityKind[];
  activitySelectionMode: LobbyActivitySelectionMode;
  includeCommunityCards: boolean;
  mixedCategories: GameCategory[];
  pickedContentMode: DiscoveryContentMode | null;
  pickedPool: DiscoveryPool | null;
  source: "random" | null;
}

interface RandomLobbyHrefOptions {
  categoryFilter: GameCategory | "ALL";
  contentMode: DiscoveryContentMode;
  game: Pick<GameSummary, "category" | "id">;
  pool?: DiscoveryPool;
}

const ACTIVITY_KIND_BY_CATEGORY: Partial<Record<GameCategory, GameActivityKind>> =
  {
    "Board Games": "BOARD_GAME",
    "Card Games": "CARD_GAME",
    "Dice Games": "DICE_GAME",
  };

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function values(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => item.split(","));
  }

  return value ? value.split(",") : [];
}

function isActivityKind(value: string): value is GameActivityKind {
  return GAME_ACTIVITY_KINDS.includes(value as GameActivityKind);
}

function isCategory(value: string): value is GameCategory {
  return GAME_CATEGORIES.includes(value as GameCategory);
}

export function getActivityKindForCategory(category: GameCategory) {
  return ACTIVITY_KIND_BY_CATEGORY[category] ?? null;
}

export function buildRandomLobbyCreateHref({
  categoryFilter,
  contentMode,
  game,
  pool,
}: RandomLobbyHrefOptions) {
  const params = new URLSearchParams({ fromRandom: "1" });

  if (pool) {
    params.set("pool", pool);
  }

  params.set("mode", contentMode);
  const explicitActivityKind =
    categoryFilter !== "ALL" ? getActivityKindForCategory(categoryFilter) : null;
  const baseActivityKind = getActivityKindForCategory(game.category);

  if (explicitActivityKind) {
    // The player explicitly filtered on one physical category, so an
    // offline-only lobby with that equipment is what they asked for.
    params.set("activitySelectionMode", "ONLY_SELECTED");
    params.append("activityKinds", explicitActivityKind);
  } else if (baseActivityKind) {
    // Random landed on a physical game without an explicit filter: keep the
    // normal mix so the lobby is not restricted to one equipment type.
    params.set("activitySelectionMode", "MIXED");
    params.append("activityKinds", baseActivityKind);
  } else if (contentMode === "DIGITAL") {
    params.set("activitySelectionMode", "MIXED");
  }

  return `/lobby/create/${game.id}?${params.toString()}`;
}

export function getLobbyCreateDefaults(
  searchParams: Record<string, string | string[] | undefined>,
  baseCategory: GameCategory,
): LobbyCreateDefaults {
  const source = firstValue(searchParams.fromRandom) === "1" ? "random" : null;
  const queryActivityKinds = values(searchParams.activityKinds).filter(isActivityKind);
  const baseActivityKind = source ? getActivityKindForCategory(baseCategory) : null;
  const activityKinds =
    queryActivityKinds.length > 0
      ? queryActivityKinds
      : baseActivityKind
        ? [baseActivityKind]
        : [];
  const requestedMode = firstValue(searchParams.activitySelectionMode);
  const activitySelectionMode: LobbyActivitySelectionMode =
    requestedMode === "ONLY_SELECTED" && activityKinds.length > 0
      ? "ONLY_SELECTED"
      : "MIXED";

  const requestedPool = firstValue(searchParams.pool);
  const requestedContentMode = firstValue(searchParams.mode);

  return {
    activityKinds,
    activitySelectionMode,
    includeCommunityCards:
      firstValue(searchParams.includeCommunityCards) === "1" ||
      firstValue(searchParams.includeCommunityCards) === "true",
    mixedCategories: values(searchParams.mixedCategories).filter(isCategory),
    pickedContentMode:
      requestedContentMode === "BOTH" ||
      requestedContentMode === "DIGITAL" ||
      requestedContentMode === "PHYSICAL"
        ? requestedContentMode
        : null,
    pickedPool: DISCOVERY_POOLS.includes(requestedPool as DiscoveryPool)
      ? (requestedPool as DiscoveryPool)
      : null,
    source,
  };
}
