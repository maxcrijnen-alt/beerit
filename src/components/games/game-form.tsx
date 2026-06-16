"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createGameAction } from "@/app/create/actions";
import { GameCardEditor } from "@/components/games/game-card-editor";
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
import { toTitleCase } from "@/lib/utils";
import { gameFormSchema, type GameFormValues } from "@/lib/validation/games";
import {
  GAME_CATEGORIES,
  GAME_INTENSITIES,
  GAME_VISIBILITIES,
} from "@/types/database";

interface GameFormProps {
  defaultValues?: GameFormValues;
  heading?: string;
  submitLabel?: string;
}

const initialValues: GameFormValues = {
  cards: [
    {
      activityKind: null,
      beeritsValue: 1,
      cardType: "QUESTION",
      intensity: "Funny",
      text: "",
      timerBehavior: "FIXED",
      timerMaxSeconds: null,
      timerMinSeconds: null,
      timerSeconds: null,
    },
  ],
  category: "Truth or Dare",
  concept: "",
  description: "",
  estimatedDuration: 20,
  intensity: "Funny",
  maxPlayers: 10,
  minPlayers: 2,
  remixedFromGameId: null,
  rules: "",
  rulesUrl: "",
  title: "",
  visibility: "PUBLIC",
};

export function GameForm({
  defaultValues = initialValues,
  heading = "Create a game",
  submitLabel = "Publish game",
}: GameFormProps) {
  const [state, action, pending] = useActionState(
    createGameAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<GameFormValues>({
    defaultValues,
    resolver: zodResolver(gameFormSchema),
  });
  const cards = useFieldArray({
    control: form.control,
    name: "cards",
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        const payload = new FormData();
        payload.set("payload", JSON.stringify(values));
        startTransition(() => action(payload));
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>
            Beerits are fictional penalty points. Keep every card playable
            without requiring alcohol. Public games are stored in the cloud
            and can receive likes or dislikes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.title?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select id="category" {...form.register("category")}>
                {GAME_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Select id="intensity" {...form.register("intensity")}>
                {GAME_INTENSITIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="concept">Your concept or theme</Label>
            <Input
              id="concept"
              placeholder="For example: birthday roast, road trip, or house rules"
              {...form.register("concept")}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Optional and free-form. Use this when the preset categories do
              not fully describe your idea.
            </p>
            <p className="text-xs text-destructive">
              {form.formState.errors.concept?.message}
            </p>
          </div>
          <p className="rounded-lg bg-secondary p-3 text-xs leading-5 text-muted-foreground">
            Adding a physical card, board, or dice game? Choose its category,
            then add an Activity card below and select the matching equipment
            type. Public offline games can then appear in weighted random
            offline lobbies. More likes increase their chance; dislikes reduce
            it.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minPlayers">Min players</Label>
              <Input
                id="minPlayers"
                min={1}
                type="number"
                {...form.register("minPlayers", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max players</Label>
              <Input
                id="maxPlayers"
                min={1}
                type="number"
                {...form.register("maxPlayers", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Minutes</Label>
              <Input
                id="estimatedDuration"
                min={1}
                type="number"
                {...form.register("estimatedDuration", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
          <p className="text-xs text-destructive">
            {form.formState.errors.maxPlayers?.message}
          </p>
          <div className="space-y-2">
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              placeholder={"Setup\nDescribe what players need.\n\nHow to play\nExplain the turns and flow.\n\nScoring\nDescribe how Beerits are awarded."}
              rows={6}
              {...form.register("rules")}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Optional. Use Setup / How to play / Scoring sections for clarity.
              Keep it short — players see this before creating a lobby.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rulesUrl">Full rules link (optional)</Label>
            <Input
              id="rulesUrl"
              placeholder="https://example.com/full-rules"
              type="url"
              {...form.register("rulesUrl")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.rulesUrl?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select id="visibility" {...form.register("visibility")}>
              {GAME_VISIBILITIES.map((value) => (
                <option key={value} value={value}>
                  {toTitleCase(value)}
                </option>
              ))}
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              Public games appear in Browse. Unlisted games work through a
              direct link. Private games stay visible only to you.
            </p>
          </div>
        </CardContent>
      </Card>
      <GameCardEditor
        append={cards.append}
        control={form.control}
        errors={form.formState.errors}
        fields={cards.fields}
        move={cards.move}
        register={form.register}
        remove={cards.remove}
        setValue={form.setValue}
      />
      {form.formState.errors.cards?.message ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.cards.message}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        <Save className="size-4" />
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
