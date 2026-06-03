"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { updateGameConceptAction } from "@/app/games/creator-actions";
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
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";
import {
  updateGameConceptSchema,
  type UpdateGameConceptValues,
} from "@/lib/validation/games";

interface GameConceptFormProps {
  concept: string | null;
  gameId: string;
}

export function GameConceptForm({ concept, gameId }: GameConceptFormProps) {
  const [state, action, pending] = useActionState(
    updateGameConceptAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<UpdateGameConceptValues>({
    defaultValues: { concept: concept ?? "", gameId },
    resolver: zodResolver(updateGameConceptSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concept or theme</CardTitle>
        <CardDescription>
          Add your own free-form idea without being limited to a preset
          category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => {
            const payload = new FormData();

            payload.set("payload", JSON.stringify(values));
            startTransition(() => action(payload));
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="concept">Your concept</Label>
            <Input
              id="concept"
              placeholder="For example: birthday roast or road trip"
              {...form.register("concept")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.concept?.message}
            </p>
          </div>
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
          <Button disabled={pending} type="submit">
            <Save className="size-4" />
            {pending ? "Saving..." : "Save concept"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
