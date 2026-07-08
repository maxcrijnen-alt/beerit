"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useWatch } from "react-hook-form";
import type {
  Control,
  FieldErrors,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayMove,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GameFormValues } from "@/lib/validation/games";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CARD_TYPES,
  GAME_INTENSITIES,
  TIMER_BEHAVIORS,
  type GameCardType,
  type TimerBehavior,
} from "@/types/database";

interface GameCardEditorProps {
  append: UseFieldArrayAppend<GameFormValues, "cards">;
  control: Control<GameFormValues>;
  errors: FieldErrors<GameFormValues>;
  fields: FieldArrayWithId<GameFormValues, "cards", "id">[];
  move: UseFieldArrayMove;
  register: UseFormRegister<GameFormValues>;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<GameFormValues>;
}

function createCard(
  cardType: GameFormValues["cards"][number]["cardType"],
  timerBehavior: TimerBehavior = "FIXED",
): GameFormValues["cards"][number] {
  const isTimedEvent = cardType === "TIMED_EVENT";
  const isBombMode = isTimedEvent && timerBehavior === "RANDOM_BOMB";

  return {
    activityKind: cardType === "ACTIVITY" ? "OTHER" : null,
    beeritsValue: 1,
    cardType,
    intensity: "Funny",
    text: "",
    timerBehavior: isTimedEvent ? timerBehavior : "FIXED",
    timerMaxSeconds: isBombMode ? 180 : null,
    timerMinSeconds: isBombMode ? 20 : null,
    timerSeconds: isTimedEvent && !isBombMode ? 20 : null,
  };
}

export function GameCardEditor({
  append,
  control,
  errors,
  fields,
  move,
  register,
  remove,
  setValue,
}: GameCardEditorProps) {
  const watchedCards = useWatch({ control, name: "cards" });

  function syncCardFieldsForType(index: number, cardType: GameCardType) {
    const currentActivityKind = watchedCards?.[index]?.activityKind;
    const currentTimerBehavior = watchedCards?.[index]?.timerBehavior ?? "FIXED";
    const currentTimerMinSeconds = watchedCards?.[index]?.timerMinSeconds;
    const currentTimerMaxSeconds = watchedCards?.[index]?.timerMaxSeconds;
    const currentTimerSeconds = watchedCards?.[index]?.timerSeconds;
    const timerBehavior =
      cardType === "TIMED_EVENT" ? currentTimerBehavior : "FIXED";
    const isBombMode = cardType === "TIMED_EVENT" && timerBehavior === "RANDOM_BOMB";
    const timerSeconds =
      typeof currentTimerSeconds === "number" && Number.isFinite(currentTimerSeconds)
        ? currentTimerSeconds
        : 20;
    const timerMinSeconds =
      typeof currentTimerMinSeconds === "number" &&
      Number.isFinite(currentTimerMinSeconds)
        ? currentTimerMinSeconds
        : 20;
    const timerMaxSeconds =
      typeof currentTimerMaxSeconds === "number" &&
      Number.isFinite(currentTimerMaxSeconds)
        ? Math.max(currentTimerMaxSeconds, timerMinSeconds)
        : 180;

    setValue(`cards.${index}.cardType`, cardType, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      `cards.${index}.activityKind`,
      cardType === "ACTIVITY" ? currentActivityKind ?? "OTHER" : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    setValue(
      `cards.${index}.timerSeconds`,
      cardType === "TIMED_EVENT" && !isBombMode ? timerSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    setValue(`cards.${index}.timerBehavior`, timerBehavior, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      `cards.${index}.timerMinSeconds`,
      isBombMode ? timerMinSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    setValue(
      `cards.${index}.timerMaxSeconds`,
      isBombMode ? timerMaxSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function syncTimerBehavior(index: number, timerBehavior: TimerBehavior) {
    const currentTimerMinSeconds = watchedCards?.[index]?.timerMinSeconds;
    const currentTimerMaxSeconds = watchedCards?.[index]?.timerMaxSeconds;
    const currentTimerSeconds = watchedCards?.[index]?.timerSeconds;
    const timerSeconds =
      typeof currentTimerSeconds === "number" && Number.isFinite(currentTimerSeconds)
        ? currentTimerSeconds
        : 20;
    const timerMinSeconds =
      typeof currentTimerMinSeconds === "number" &&
      Number.isFinite(currentTimerMinSeconds)
        ? currentTimerMinSeconds
        : 20;
    const timerMaxSeconds =
      typeof currentTimerMaxSeconds === "number" &&
      Number.isFinite(currentTimerMaxSeconds)
        ? Math.max(currentTimerMaxSeconds, timerMinSeconds)
        : 180;
    const isBombMode = timerBehavior === "RANDOM_BOMB";

    setValue(`cards.${index}.timerBehavior`, timerBehavior, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`cards.${index}.timerSeconds`, isBombMode ? null : timerSeconds, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      `cards.${index}.timerMinSeconds`,
      isBombMode ? timerMinSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    setValue(
      `cards.${index}.timerMaxSeconds`,
      isBombMode ? timerMaxSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Cards</h2>
          <p className="text-xs text-muted-foreground">
            Players will move through these in order.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            onClick={() => append(createCard("QUESTION"))}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-3.5" />
            Question
          </Button>
          <Button
            onClick={() => append(createCard("DARE"))}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-3.5" />
            Dare
          </Button>
          <Button
            onClick={() => append(createCard("ACTIVITY"))}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-3.5" />
            Activity
          </Button>
          <Button
            onClick={() => append(createCard("TIMED_EVENT"))}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-3.5" />
            Timer
          </Button>
          <Button
            onClick={() => append(createCard("TIMED_EVENT", "RANDOM_BOMB"))}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Plus className="size-3.5" />
            Bomb
          </Button>
        </div>
      </div>
      {fields.map((field, index) => {
        const selectedCardType =
          watchedCards?.[index]?.cardType ?? field.cardType;
        const selectedTimerBehavior =
          watchedCards?.[index]?.timerBehavior ?? field.timerBehavior ?? "FIXED";
        const isActivityCard = selectedCardType === "ACTIVITY";
        const isTimedEventCard = selectedCardType === "TIMED_EVENT";
        const isBombMode = isTimedEventCard && selectedTimerBehavior === "RANDOM_BOMB";

        return (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Card {index + 1}</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                aria-label={`Move card ${index + 1} up`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                aria-label={`Move card ${index + 1} down`}
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                aria-label={`Remove card ${index + 1}`}
                onClick={() => remove(index)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`cards.${index}.text`}>Text</Label>
              <Textarea
                id={`cards.${index}.text`}
                placeholder="What should the group do or answer?"
                {...register(`cards.${index}.text`)}
              />
              <p className="text-xs text-destructive">
                {errors.cards?.[index]?.text?.message}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.cardType`}>Type</Label>
                <Select
                  id={`cards.${index}.cardType`}
                  {...register(`cards.${index}.cardType`, {
                    onChange: (event) =>
                      syncCardFieldsForType(
                        index,
                        event.target.value as GameCardType,
                      ),
                  })}
                >
                  {GAME_CARD_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {toTitleCase(value)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.intensity`}>Intensity</Label>
                <Select
                  id={`cards.${index}.intensity`}
                  {...register(`cards.${index}.intensity`)}
                >
                  {GAME_INTENSITIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.activityKind`}>Activity</Label>
                <Select
                  disabled={!isActivityCard}
                  id={`cards.${index}.activityKind`}
                  {...register(`cards.${index}.activityKind`, {
                    setValueAs: (value) => value || null,
                  })}
                >
                  <option value="">Not an activity</option>
                  {GAME_ACTIVITY_KINDS.map((value) => (
                    <option key={value} value={value}>
                      {toTitleCase(value)}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-destructive">
                  {errors.cards?.[index]?.activityKind?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.beeritsValue`}>Beerits</Label>
                <Input
                  id={`cards.${index}.beeritsValue`}
                  max={20}
                  min={0}
                  type="number"
                  {...register(`cards.${index}.beeritsValue`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.timerBehavior`}>Timer mode</Label>
                <Select
                  disabled={!isTimedEventCard}
                  id={`cards.${index}.timerBehavior`}
                  {...register(`cards.${index}.timerBehavior`, {
                    onChange: (event) =>
                      syncTimerBehavior(
                        index,
                        event.target.value as TimerBehavior,
                      ),
                  })}
                >
                  {TIMER_BEHAVIORS.map((value) => (
                    <option key={value} value={value}>
                      {value === "RANDOM_BOMB" ? "Bomb mode" : "Fixed timer"}
                    </option>
                  ))}
                </Select>
              </div>
              {isBombMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`cards.${index}.timerMinSeconds`}>Min</Label>
                    <Input
                      id={`cards.${index}.timerMinSeconds`}
                      max={300}
                      min={5}
                      type="number"
                      {...register(`cards.${index}.timerMinSeconds`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                    <p className="text-xs text-destructive">
                      {errors.cards?.[index]?.timerMinSeconds?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cards.${index}.timerMaxSeconds`}>Max</Label>
                    <Input
                      id={`cards.${index}.timerMaxSeconds`}
                      max={300}
                      min={5}
                      type="number"
                      {...register(`cards.${index}.timerMaxSeconds`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                    <p className="text-xs text-destructive">
                      {errors.cards?.[index]?.timerMaxSeconds?.message}
                    </p>
                  </div>
                </>
              ) : (
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.timerSeconds`}>Seconds</Label>
                <Input
                  disabled={!isTimedEventCard}
                  id={`cards.${index}.timerSeconds`}
                  max={300}
                  min={5}
                  placeholder="None"
                  type="number"
                  {...register(`cards.${index}.timerSeconds`, {
                    setValueAs: (value) => (value === "" ? null : Number(value)),
                  })}
                />
                <p className="text-xs text-destructive">
                  {errors.cards?.[index]?.timerSeconds?.message}
                </p>
              </div>
              )}
            </div>
          </CardContent>
        </Card>
        );
      })}
    </section>
  );
}
