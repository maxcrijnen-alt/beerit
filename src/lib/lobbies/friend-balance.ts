import type { LobbyPlayer } from "@/types/database";

export interface FriendBalanceEntry {
  balancePoints: number;
  beerits: number;
  displayName: string;
  place: number;
  playerId: string;
}

const PLACEMENT_BASE_POINTS = [5, 3, 1];

/**
 * Convert a finished lobby scoreboard into fictional, zero-sum Balance Points
 * for the Friend Balance summary. Fewer Beerits means a better placement.
 * Ties share the average of the base points for the slots they occupy, and
 * the result is normalized so the group total is exactly zero.
 *
 * Balance Points are a fictional group score only: no money, no debt, no
 * settlement, no real-world value.
 */
export function calculateFriendBalance(
  players: LobbyPlayer[],
): FriendBalanceEntry[] {
  if (players.length < 2) {
    return [];
  }

  const sorted = [...players].sort((a, b) => a.beerits - b.beerits);
  const baseFor = (slot: number) => PLACEMENT_BASE_POINTS[slot] ?? 0;
  const rawPoints = new Map<string, { base: number; place: number }>();
  let slot = 0;

  while (slot < sorted.length) {
    let tieEnd = slot;

    while (
      tieEnd + 1 < sorted.length &&
      sorted[tieEnd + 1].beerits === sorted[slot].beerits
    ) {
      tieEnd += 1;
    }

    let tieTotal = 0;

    for (let i = slot; i <= tieEnd; i += 1) {
      tieTotal += baseFor(i);
    }

    const shared = tieTotal / (tieEnd - slot + 1);

    for (let i = slot; i <= tieEnd; i += 1) {
      rawPoints.set(sorted[i].id, { base: shared, place: slot + 1 });
    }

    slot = tieEnd + 1;
  }

  const average =
    sorted.reduce((sum, player) => sum + (rawPoints.get(player.id)?.base ?? 0), 0) /
    sorted.length;

  return sorted.map((player) => {
    const raw = rawPoints.get(player.id) ?? { base: 0, place: sorted.length };

    return {
      balancePoints: Math.round((raw.base - average) * 10) / 10,
      beerits: player.beerits,
      displayName: player.display_name,
      place: raw.place,
      playerId: player.id,
    };
  });
}
