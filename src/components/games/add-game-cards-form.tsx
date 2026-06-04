"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { addGameCardsAction } from "@/app/games/creator-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";
import {
  newGameCardsSchema,
  type NewGameCardsValues,
} from "@/lib/validation/games";
import {
  GAME_ACTIVITY_KINDS,
  GAME_CARD_TYPES,
  GAME_INTENSITIES,
  TIMER_BEHAVIORS,
  type GameCardType,
  type TimerBehavior,
} from "@/types/database";

interface AddGameCardsFormProps {
  cardsCount: number;
  gameId: string;
}

function createCard(
  cardType: GameCardType,
  timerBehavior: TimerBehavior = "FIXED",
): NewGameCardsValues["cards"][number] {
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

export function AddGameCardsForm({
  cardsCount,
  gameId,
}: AddGameCardsFormProps) {
  const [state, action, pending] = useActionState(
    addGameCardsAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<NewGameCardsValues>({
    defaultValues: { cards: [createCard("QUESTION")] },
    resolver: zodResolver(newGameCardsSchema),
  });
  const cards = useFieldArray({
    control: form.control,
    name: "cards",
  });
  const watchedCards = useWatch({ control: form.control, name: "cards" });

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

    form.setValue(`cards.${index}.cardType`, cardType, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      `cards.${index}.activityKind`,
      cardType === "ACTIVITY" ? currentActivityKind ?? "OTHER" : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(
      `cards.${index}.timerSeconds`,
      cardType === "TIMED_EVENT" && !isBombMode ? timerSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(`cards.${index}.timerBehavior`, timerBehavior, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      `cards.${index}.timerMinSeconds`,
      isBombMode ? timerMinSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(
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

    form.setValue(`cards.${index}.timerBehavior`, timerBehavior, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      `cards.${index}.timerSeconds`,
      isBombMode ? null : timerSeconds,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(
      `cards.${index}.timerMinSeconds`,
      isBombMode ? timerMinSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(
      `cards.${index}.timerMaxSeconds`,
      isBombMode ? timerMaxSeconds : null,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        const payload = new FormData();

        payload.set("payload", JSON.stringify({ ...values, gameId }));
        startTransition(() => action(payload));
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Add cards</CardTitle>
          <CardDescription>
            Add new questions, dares, votes, rules, or your own custom card
            ideas. New cards are placed after the existing {cardsCount} cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => cards.append(createCard("QUESTION"))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="size-3.5" />
              Add question
            </Button>
            <Button
              onClick={() => cards.append(createCard("DARE"))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="size-3.5" />
              Add dare
            </Button>
            <Button
              onClick={() => cards.append(createCard("ACTIVITY"))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="size-3.5" />
              Add activity
            </Button>
            <Button
              onClick={() => cards.append(createCard("TIMED_EVENT"))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="size-3.5" />
              Add timer
            </Button>
            <Button
              onClick={() => cards.append(createCard("TIMED_EVENT", "RANDOM_BOMB"))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus className="size-3.5" />
              Add bomb
            </Button>
          </div>
        </CardContent>
      </Card>
      {cards.fields.map((field, index) => {
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
            <CardTitle className="text-sm">New card {index + 1}</CardTitle>
            <Button
              aria-label={`Remove new card ${index + 1}`}
              disabled={cards.fields.length === 1}
              onClick={() => cards.remove(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`cards.${index}.text`}>Text</Label>
              <Textarea
                id={`cards.${index}.text`}
                placeholder="What should the group answer or do?"
                {...form.register(`cards.${index}.text`)}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.cards?.[index]?.text?.message}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.cardType`}>Type</Label>
                <Select
                  id={`cards.${index}.cardType`}
                  {...form.register(`cards.${index}.cardType`, {
                    onChange: (event) =>
                      syncCardFieldsForType(
                        index,
                        event.target.value as GameCardType,
                      ),
                  })}
                >
                  {GAME_CARD_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.intensity`}>Intensity</Label>
                <Select
                  id={`cards.${index}.intensity`}
                  {...form.register(`cards.${index}.intensity`)}
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
                  {...form.register(`cards.${index}.activityKind`, {
                    setValueAs: (value) => value || null,
                  })}
                >
                  <option value="">Not an activity</option>
                  {GAME_ACTIVITY_KINDS.map((value) => (
                    <option key={value} value={value}>
                      {value.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-destructive">
                  {form.formState.errors.cards?.[index]?.activityKind?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.beeritsValue`}>Beerits</Label>
                <Input
                  id={`cards.${index}.beeritsValue`}
                  max={20}
                  min={0}
                  type="number"
                  {...form.register(`cards.${index}.beeritsValue`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cards.${index}.timerBehavior`}>Timer mode</Label>
                <Select
                  disabled={!isTimedEventCard}
                  id={`cards.${index}.timerBehavior`}
                  {...form.register(`cards.${index}.timerBehavior`, {
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
                      {...form.register(`cards.${index}.timerMinSeconds`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                    <p className="text-xs text-destructive">
                      {form.formState.errors.cards?.[index]?.timerMinSeconds?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cards.${index}.timerMaxSeconds`}>Max</Label>
                    <Input
                      id={`cards.${index}.timerMaxSeconds`}
                      max={300}
                      min={5}
                      type="number"
                      {...form.register(`cards.${index}.timerMaxSeconds`, {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                    <p className="text-xs text-destructive">
                      {form.formState.errors.cards?.[index]?.timerMaxSeconds?.message}
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
                  {...form.register(`cards.${index}.timerSeconds`, {
                    setValueAs: (value) => (value === "" ? null : Number(value)),
                  })}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.cards?.[index]?.timerSeconds?.message}
                </p>
              </div>
              )}
            </div>
          </CardContent>
        </Card>
        );
      })}
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-lg bg-secondary p-3 text-sm text-secondary-foreground"
              : "rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        <Save className="size-4" />
        {pending ? "Adding cards..." : "Add cards to game"}
      </Button>
    </form>
  );
}
