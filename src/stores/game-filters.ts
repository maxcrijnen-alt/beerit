"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscoveryPool } from "@/lib/games/ranking";
import type { GameCategory, GameIntensity } from "@/types/database";

export type DiscoveryContentMode = "BOTH" | "DIGITAL" | "PHYSICAL";
export type GameSort = "liked" | "new" | "random" | "top" | "trending";

const MAX_RECENT_RANDOM_GAMES = 12;

interface GameFiltersState {
  addRecentRandomGameId: (gameId: string) => void;
  category: GameCategory | "ALL";
  clearRecentRandomGameIds: () => void;
  contentMode: DiscoveryContentMode;
  durationMaxMinutes: number | null;
  intensity: GameIntensity | "ALL";
  pool: DiscoveryPool;
  players: number | null;
  query: string;
  randomSeed: number;
  recentRandomGameIds: string[];
  reset: () => void;
  setCategory: (category: GameCategory | "ALL") => void;
  setContentMode: (contentMode: DiscoveryContentMode) => void;
  setDurationMaxMinutes: (durationMaxMinutes: number | null) => void;
  setIntensity: (intensity: GameIntensity | "ALL") => void;
  setPlayers: (players: number | null) => void;
  setPool: (pool: DiscoveryPool) => void;
  setQuery: (query: string) => void;
  setSort: (sort: GameSort) => void;
  sort: GameSort;
}

const initialFilters = {
  category: "ALL" as const,
  contentMode: "BOTH" as const,
  durationMaxMinutes: null,
  intensity: "ALL" as const,
  pool: "HOT" as const,
  players: null,
  query: "",
  sort: "trending" as const,
};

export const useGameFiltersStore = create<GameFiltersState>()(
  persist(
    (set) => ({
      ...initialFilters,
      recentRandomGameIds: [],
      randomSeed: 0,
      addRecentRandomGameId: (gameId) =>
        set((state) => ({
          recentRandomGameIds: [
            gameId,
            ...state.recentRandomGameIds.filter((id) => id !== gameId),
          ].slice(0, MAX_RECENT_RANDOM_GAMES),
        })),
      clearRecentRandomGameIds: () => set({ recentRandomGameIds: [] }),
      reset: () => set({ ...initialFilters, randomSeed: Date.now() }),
      setCategory: (category) => set({ category }),
      setContentMode: (contentMode) => set({ contentMode }),
      setDurationMaxMinutes: (durationMaxMinutes) => set({ durationMaxMinutes }),
      setIntensity: (intensity) => set({ intensity }),
      setPlayers: (players) => set({ players }),
      setPool: (pool) => set({ pool, randomSeed: Date.now() }),
      setQuery: (query) => set({ query }),
      setSort: (sort) => set({ randomSeed: Date.now(), sort }),
    }),
    {
      name: "beerit-game-discovery",
      partialize: (state) => ({
        recentRandomGameIds: state.recentRandomGameIds,
      }),
    },
  ),
);
