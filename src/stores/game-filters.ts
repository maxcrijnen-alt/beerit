"use client";

import { create } from "zustand";
import type { GameCategory, GameIntensity } from "@/types/database";

export type GameSort = "trending" | "liked" | "new" | "random";

interface GameFiltersState {
  category: GameCategory | "ALL";
  intensity: GameIntensity | "ALL";
  players: number | null;
  query: string;
  randomSeed: number;
  reset: () => void;
  setCategory: (category: GameCategory | "ALL") => void;
  setIntensity: (intensity: GameIntensity | "ALL") => void;
  setPlayers: (players: number | null) => void;
  setQuery: (query: string) => void;
  setSort: (sort: GameSort) => void;
  sort: GameSort;
}

const initialFilters = {
  category: "ALL" as const,
  intensity: "ALL" as const,
  players: null,
  query: "",
  sort: "trending" as const,
};

export const useGameFiltersStore = create<GameFiltersState>((set) => ({
  ...initialFilters,
  randomSeed: 0,
  reset: () => set({ ...initialFilters, randomSeed: Date.now() }),
  setCategory: (category) => set({ category }),
  setIntensity: (intensity) => set({ intensity }),
  setPlayers: (players) => set({ players }),
  setQuery: (query) => set({ query }),
  setSort: (sort) => set({ randomSeed: Date.now(), sort }),
}));
