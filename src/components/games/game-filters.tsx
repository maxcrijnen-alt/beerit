"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useGameFiltersStore } from "@/stores/game-filters";
import { GAME_CATEGORIES, GAME_INTENSITIES } from "@/types/database";

export function GameFilters() {
  const {
    category,
    intensity,
    players,
    query,
    reset,
    setCategory,
    setIntensity,
    setPlayers,
    setQuery,
    setSort,
    sort,
  } = useGameFiltersStore();
  const hasFilters =
    category !== "ALL" ||
    intensity !== "ALL" ||
    players !== null ||
    query.length > 0 ||
    sort !== "trending";
  const quickCategories = ["Card Games", "Board Games", "Dice Games"] as const;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="size-4 text-primary" />
        Find a game
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search games"
          value={query}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          aria-label="Sort games"
          onChange={(event) =>
            setSort(event.target.value as "liked" | "new" | "random" | "trending")
          }
          value={sort}
        >
          <option value="trending">Trending</option>
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
              event.target.value as (typeof GAME_INTENSITIES)[number] | "ALL",
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
      {hasFilters ? (
        <Button className="w-full" onClick={reset} size="sm" variant="ghost">
          <X className="size-3.5" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
