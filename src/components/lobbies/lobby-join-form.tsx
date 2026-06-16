"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { joinLobbyAction } from "@/app/lobby/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";
import {
  joinLobbySchema,
  type JoinLobbyValues,
} from "@/lib/validation/lobbies";

export function LobbyJoinForm({ initialCode = "" }: { initialCode?: string }) {
  const [state, action, pending] = useActionState(
    joinLobbyAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<JoinLobbyValues>({
    defaultValues: { code: initialCode.toUpperCase() },
    resolver: zodResolver(joinLobbySchema),
  });
  const codeError =
    form.formState.errors.code?.message ?? state.fieldErrors?.code?.[0];

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit((values) => {
        const formData = new FormData();

        formData.set("code", values.code);
        startTransition(() => action(formData));
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="lobby-code">Lobby code</Label>
        <Input
          autoCapitalize="characters"
          autoComplete="off"
          className="font-mono uppercase tracking-[0.35em]"
          id="lobby-code"
          maxLength={6}
          placeholder="A1B2C3"
          {...form.register("code")}
        />
        {codeError ? (
          <p className="text-xs text-destructive">{codeError}</p>
        ) : null}
      </div>
      {state.message ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        <LogIn className="size-4" />
        {pending ? "Joining..." : "Join lobby"}
      </Button>
    </form>
  );
}
