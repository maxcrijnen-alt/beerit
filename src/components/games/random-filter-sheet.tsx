"use client";

import { Dices, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { useGameFiltersStore } from "@/stores/game-filters";
import {
  DISCOVERY_POOLS,
  GAME_CATEGORIES,
  GAME_INTENSITIES,
  type DiscoveryPool,
} from "@/types/database";

interface RandomFilterSheetProps {
  onOpenChange: (open: boolean) => void;
  onStart: (options?: { surprise: boolean }) => void;
  open: boolean;
  pending: boolean;
}

const POOL_LABELS: Record<DiscoveryPool, string> = {
  HOT: "Hot",
  MOST_LIKED: "Most liked",
  RECENT: "Recent",
  SURPRISE: "Surprise me",
  TOP: "Top",
};

const DURATION_OPTIONS = [
  { label: "Any duration", value: "" },
  { label: "Up to 15 minutes", value: "15" },
  { label: "Up to 30 minutes", value: "30" },
  { label: "Up to 60 minutes", value: "60" },
  { label: "Up to 2 hours", value: "120" },
];

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function RandomFilterSheet({
  onOpenChange,
  onStart,
  open,
  pending,
}: RandomFilterSheetProps) {
  const {
    contentMode,
    durationMaxMinutes,
    players,
    pool,
    randomCategories,
    randomIntensities,
    setContentMode,
    setDurationMaxMinutes,
    setPlayers,
    setPool,
    setRandomCategories,
    setRandomIntensities,
  } = useGameFiltersStore();
  const allCategoriesSelected =
    randomCategories.length === GAME_CATEGORIES.length;
  const canStart = randomCategories.length > 0 && randomIntensities.length > 0;

  return (
    <Sheet onOpenChange={onOpenChange} open={open} title="Random game filters">
      <div className="space-y-5 pb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Categories</Label>
            <Button
              onClick={() =>
                setRandomCategories(
                  allCategoriesSelected ? [] : [...GAME_CATEGORIES],
                )
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              {allCategoriesSelected ? "Unselect all" : "Select all"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {GAME_CATEGORIES.map((value) => {
              const selected = randomCategories.includes(value);

              return (
                <button
                  aria-pressed={selected}
                  className={`min-h-9 rounded-full border px-3 text-xs font-medium transition ${
                    selected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                  key={value}
                  onClick={() =>
                    setRandomCategories(toggleValue(randomCategories, value))
                  }
                  type="button"
                >
                  {value}
                </button>
              );
            })}
          </div>
          {randomCategories.length === 0 ? (
            <p className="text-xs text-destructive">
              Select at least one category.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Game type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["BOTH", "Both"],
                ["DIGITAL", "Prompt"],
                ["PHYSICAL", "Physical"],
              ] as const
            ).map(([value, label]) => (
              <button
                aria-pressed={contentMode === value}
                className={`min-h-10 rounded-xl border px-2 text-xs font-medium transition ${
                  contentMode === value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                key={value}
                onClick={() => setContentMode(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Intensity</Label>
          <div className="grid grid-cols-4 gap-2">
            {GAME_INTENSITIES.map((value) => {
              const selected = randomIntensities.includes(value);

              return (
                <button
                  aria-pressed={selected}
                  className={`min-h-10 rounded-xl border px-2 text-xs font-medium transition ${
                    selected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                  key={value}
                  onClick={() =>
                    setRandomIntensities(toggleValue(randomIntensities, value))
                  }
                  type="button"
                >
                  {value}
                </button>
              );
            })}
          </div>
          {randomIntensities.length === 0 ? (
            <p className="text-xs text-destructive">
              Select at least one intensity.
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="random-players">Players</Label>
            <Input
              id="random-players"
              inputMode="numeric"
              min={1}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);

                setPlayers(Number.isFinite(value) && value > 0 ? value : null);
              }}
              placeholder="Any"
              type="number"
              value={players ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="random-duration">Duration</Label>
            <Select
              id="random-duration"
              onChange={(event) =>
                setDurationMaxMinutes(
                  event.target.value
                    ? Number.parseInt(event.target.value, 10)
                    : null,
                )
              }
              value={durationMaxMinutes ?? ""}
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="random-pool">Ranking mode</Label>
          <Select
            id="random-pool"
            onChange={(event) => setPool(event.target.value as DiscoveryPool)}
            value={pool}
          >
            {DISCOVERY_POOLS.map((value) => (
              <option key={value} value={value}>
                {POOL_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 pt-1">
          <Button
            className="w-full"
            disabled={pending || !canStart}
            onClick={() => onStart()}
            size="lg"
            type="button"
          >
            <Shuffle className="size-4" />
            {pending ? "Picking..." : "Start random lobby"}
          </Button>
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => onStart({ surprise: true })}
            type="button"
            variant="outline"
          >
            <Dices className="size-4" />
            I don&rsquo;t care — surprise me
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
