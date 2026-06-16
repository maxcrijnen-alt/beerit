"use client";

import { Gamepad2 } from "lucide-react";
import { useState, useActionState } from "react";
import { createLobbyAction } from "@/app/lobby/actions";
import { Button } from "@/components/ui/button";
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";
import type { LobbyCreateDefaults } from "@/lib/lobbies/defaults";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CATEGORIES,
  type GameActivityKind,
  type GameCategory,
} from "@/types/database";

interface LobbyCreateFormProps {
  baseCategory: GameCategory;
  defaults?: LobbyCreateDefaults;
  gameId: string;
}

const ACTIVITY_LABELS: Record<GameActivityKind, string> = {
  BOARD_GAME: "Board games, such as chess",
  CARD_GAME: "Card games",
  DICE_GAME: "Dice games",
  OTHER: "Other offline activities",
};

export function LobbyCreateForm({
  baseCategory,
  defaults,
  gameId,
}: LobbyCreateFormProps) {
  const [state, action, pending] = useActionState(
    createLobbyAction,
    INITIAL_ACTION_STATE,
  );
  const [selectionMode, setSelectionMode] = useState(
    defaults?.activitySelectionMode ?? "MIXED",
  );
  const [checkedKinds, setCheckedKinds] = useState<Set<GameActivityKind>>(
    new Set(defaults?.activityKinds ?? []),
  );
  const mixedCategories = defaults?.mixedCategories ?? [];
  const onlySelectedWithNoKinds =
    selectionMode === "ONLY_SELECTED" && checkedKinds.size === 0;

  function toggleKind(kind: GameActivityKind) {
    setCheckedKinds((prev) => {
      const next = new Set(prev);

      if (next.has(kind)) {
        next.delete(kind);
      } else {
        next.add(kind);
      }

      return next;
    });
  }

  return (
    <form action={action} className="space-y-3">
      <input name="gameId" type="hidden" value={gameId} />
      {defaults?.source === "random" ? (
        <p className="rounded-lg bg-secondary p-3 text-xs leading-5 text-muted-foreground">
          Random picked this game from your filters. The lobby settings below
          were prefilled, but you can still change them before creating the
          room.
        </p>
      ) : null}
      <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
        <input
          className="mt-0.5 size-5 shrink-0 accent-primary"
          defaultChecked={defaults?.includeCommunityCards ?? false}
          name="includeCommunityCards"
          type="checkbox"
        />
        <span>
          <span className="block font-medium">Add recent community questions</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Popular recent questions may appear. Strongly disliked questions
            are reduced or left out.
          </span>
        </span>
      </label>
      <fieldset className="space-y-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-medium">Mix extra categories</legend>
        <p className="text-xs leading-5 text-muted-foreground">
          Optional. Add cards from public games beyond {baseCategory}.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GAME_CATEGORIES.filter((category) => category !== baseCategory).map(
            (category) => (
              <label
                className="flex min-h-10 items-center gap-2 rounded-md px-1 text-xs"
                key={category}
              >
                <input
                  className="size-4 shrink-0 accent-primary"
                  defaultChecked={mixedCategories.includes(category)}
                  name="mixedCategories"
                  type="checkbox"
                  value={category}
                />
                <span>{category}</span>
              </label>
            ),
          )}
        </div>
      </fieldset>
      <fieldset className="space-y-2 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-medium">Offline game mode</legend>
        <label className="flex min-h-11 items-start gap-2 rounded-md py-1 text-xs">
          <input
            checked={selectionMode === "MIXED"}
            className="mt-0.5 size-4 shrink-0 accent-primary"
            name="activitySelectionMode"
            onChange={() => setSelectionMode("MIXED")}
            type="radio"
            value="MIXED"
          />
          <span>
            <span className="block font-medium">Normal mix</span>
            <span className="mt-1 block leading-5 text-muted-foreground">
              Play the base game. Checked offline games may appear as extras.
              Check nothing when your group has no equipment.
            </span>
          </span>
        </label>
        <label className="flex min-h-11 items-start gap-2 rounded-md py-1 text-xs">
          <input
            checked={selectionMode === "ONLY_SELECTED"}
            className="mt-0.5 size-4 shrink-0 accent-primary"
            name="activitySelectionMode"
            onChange={() => setSelectionMode("ONLY_SELECTED")}
            type="radio"
            value="ONLY_SELECTED"
          />
          <span>
            <span className="block font-medium">Only selected offline games</span>
            <span className="mt-1 block leading-5 text-muted-foreground">
              Use this for an evening with only card games, only board games,
              only dice games, or your own combination.
            </span>
          </span>
        </label>
      </fieldset>
      <fieldset
        className={`space-y-2 rounded-lg border p-3 ${onlySelectedWithNoKinds ? "border-destructive" : "border-border"}`}
      >
        <legend className="px-1 text-sm font-medium">Available tonight</legend>
        <p className="text-xs leading-5 text-muted-foreground">
          Check only the equipment and game types your group can actually use.
        </p>
        <div className="space-y-2">
          {GAME_ACTIVITY_KINDS.map((activityKind) => (
            <label
              className="flex min-h-10 items-center gap-2 rounded-md text-xs"
              key={activityKind}
            >
              <input
                checked={checkedKinds.has(activityKind)}
                className="size-4 shrink-0 accent-primary"
                name="activityKinds"
                onChange={() => toggleKind(activityKind)}
                type="checkbox"
                value={activityKind}
              />
              <span>{ACTIVITY_LABELS[activityKind]}</span>
            </label>
          ))}
        </div>
        {onlySelectedWithNoKinds ? (
          <p className="text-xs text-destructive">
            Select at least one game type when using &ldquo;Only selected
            offline games&rdquo;.
          </p>
        ) : null}
      </fieldset>
      {state.message ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button
        className="w-full"
        disabled={pending || onlySelectedWithNoKinds}
        size="lg"
        type="submit"
      >
        <Gamepad2 className="size-4" />
        {pending ? "Creating lobby..." : "Create lobby"}
      </Button>
    </form>
  );
}
