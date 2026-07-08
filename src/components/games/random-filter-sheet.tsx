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
  HOT: "Balanced",
  MOST_LIKED: "Most liked",
  RECENT: "Fresh",
  SURPRISE: "Wildcard",
  TOP: "Best rated",
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
  const allIntensitiesSelected =
    randomIntensities.length === GAME_INTENSITIES.length;
  const canStart = randomCategories.length > 0 && randomIntensities.length > 0;

  return (
    <Sheet onOpenChange={onOpenChange} open={open} title="Start avond setup">
      <div className="space-y-5 pb-2">
        <div className="rounded-2xl border border-border bg-muted/40 p-3">
          <p className="text-sm font-semibold">Kies wat bij jullie avond past.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Beerit kiest daarna een lobby die past bij je spullen, tijd en vibe.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Game categories</Label>
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
          <Label>Materials</Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["BOTH", "Anything", "Prompts or physical games"],
                ["DIGITAL", "No materials", "Only phone prompts"],
                ["PHYSICAL", "Use gear", "Cards, dice, or boards"],
              ] as const
            ).map(([value, label, description]) => (
              <button
                aria-pressed={contentMode === value}
                className={`min-h-16 rounded-xl border px-2 py-2 text-left text-xs font-medium transition ${
                  contentMode === value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                key={value}
                onClick={() => setContentMode(value)}
                type="button"
              >
                <span className="block">{label}</span>
                <span className="mt-1 block text-[10px] font-normal leading-4 text-muted-foreground">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Vibe</Label>
            <Button
              onClick={() =>
                setRandomIntensities(
                  allIntensitiesSelected ? [] : [...GAME_INTENSITIES],
                )
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              {allIntensitiesSelected ? "Unselect all" : "Select all"}
            </Button>
          </div>
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
            <Label htmlFor="random-duration">Time</Label>
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
          <Label htmlFor="random-pool">Random style</Label>
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
          {!canStart ? (
            <p className="text-xs text-muted-foreground">
              Kies minimaal een categorie en vibe, of laat Beerit alles kiezen.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Beerit weegt likes, dislikes en recente keuzes mee bij de random pick.
            </p>
          )}
          <Button
            className="w-full"
            disabled={pending || !canStart}
            onClick={() => onStart()}
            size="lg"
            type="button"
          >
            <Shuffle className="size-4" />
            {pending ? "Picking a game..." : "Start avond"}
          </Button>
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => onStart({ surprise: true })}
            type="button"
            variant="outline"
          >
            <Dices className="size-4" />
            Skip setup - surprise me
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
