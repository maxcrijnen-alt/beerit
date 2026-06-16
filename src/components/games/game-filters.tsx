"use client";

import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type DiscoveryContentMode,
  type GameSort,
  useGameFiltersStore,
} from "@/stores/game-filters";
import { GAME_CATEGORIES, GAME_INTENSITIES } from "@/types/database";

const discoveryPresets = [
  { label: "Hot", pool: "HOT", sort: "trending" },
  { label: "Top", pool: "TOP", sort: "top" },
  { label: "Recent", pool: "RECENT", sort: "new" },
  { label: "Liked", pool: "MOST_LIKED", sort: "liked" },
  { label: "Surprise", pool: "SURPRISE", sort: "random" },
] as const;

export function GameFilters() {
  const {
    category,
    clearRecentRandomGameIds,
    contentMode,
    durationMaxMinutes,
    intensity,
    pool,
    players,
    query,
    recentRandomGameIds,
    reset,
    setCategory,
    setContentMode,
    setDurationMaxMinutes,
    setIntensity,
    setPlayers,
    setPool,
    setQuery,
    setSort,
    sort,
  } = useGameFiltersStore();
  const hasAdvancedFilters =
    category !== "ALL" ||
    contentMode !== "BOTH" ||
    durationMaxMinutes !== null ||
    intensity !== "ALL" ||
    players !== null ||
    sort !== "trending";
  const hasFilters = hasAdvancedFilters || pool !== "HOT" || query.length > 0;
  const [expanded, setExpanded] = useState(false);
  const quickCategories = ["Card Games", "Board Games", "Dice Games"] as const;

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-[0_14px_40px_rgba(48,34,18,0.07)] backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search games…"
          value={query}
        />
        {query.length > 0 ? (
          <button
            aria-label="Clear search"
            className="absolute right-3 top-3 text-muted-foreground"
            onClick={() => setQuery("")}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {discoveryPresets.map((preset) => (
          <Button
            className="shrink-0"
            key={preset.pool}
            onClick={() => {
              setPool(preset.pool);
              setSort(preset.sort);
            }}
            size="sm"
            variant={pool === preset.pool ? "secondary" : "outline"}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          <SlidersHorizontal className="size-3.5" />
          {expanded ? "Hide filters" : "More filters"}
          {expanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          {hasAdvancedFilters ? (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Active
            </span>
          ) : null}
        </button>
        {hasFilters ? (
          <button
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={reset}
            type="button"
          >
            Clear all
          </button>
        ) : null}
      </div>
      {expanded ? (
        <div className="space-y-3 border-t border-border/60 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label="Sort games"
              onChange={(event) => setSort(event.target.value as GameSort)}
              value={sort}
            >
              <option value="trending">Trending</option>
              <option value="top">Top</option>
              <option value="liked">Most liked</option>
              <option value="new">New</option>
              <option value="random">Random</option>
            </Select>
            <Select
              aria-label="Filter by players"
              onChange={(event) =>
                setPlayers(event.target.value ? Number(event.target.value) : null)
              }
              value={players ?? ""}
            >
              <option value="">Any group size</option>
              {[2, 3, 4, 5, 6, 8, 10].map((value) => (
                <option key={value} value={value}>
                  {value} players
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label="Filter by content mode"
              onChange={(event) =>
                setContentMode(event.target.value as DiscoveryContentMode)
              }
              value={contentMode}
            >
              <option value="BOTH">Prompts + physical</option>
              <option value="DIGITAL">Prompt games only</option>
              <option value="PHYSICAL">Physical games only</option>
            </Select>
            <Select
              aria-label="Filter by duration"
              onChange={(event) =>
                setDurationMaxMinutes(
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              value={durationMaxMinutes ?? ""}
            >
              <option value="">Any duration</option>
              {[15, 30, 45, 60].map((value) => (
                <option key={value} value={value}>
                  Up to {value} min
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickCategories.map((value) => (
              <Button
                key={value}
                onClick={() => setCategory(value)}
                size="sm"
                variant={category === value ? "secondary" : "outline"}
              >
                {value}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label="Filter by category"
              onChange={(event) =>
                setCategory(
                  event.target.value as (typeof GAME_CATEGORIES)[number] | "ALL",
                )
              }
              value={category}
            >
              <option value="ALL">All categories</option>
              {GAME_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by intensity"
              onChange={(event) =>
                setIntensity(
                  event.target.value as
                    | (typeof GAME_INTENSITIES)[number]
                    | "ALL",
                )
              }
              value={intensity}
            >
              <option value="ALL">All intensities</option>
              {GAME_INTENSITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </div>
          {recentRandomGameIds.length > 0 ? (
            <Button
              className="w-full"
              onClick={clearRecentRandomGameIds}
              size="sm"
              variant="ghost"
            >
              Reset recent random picks
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
