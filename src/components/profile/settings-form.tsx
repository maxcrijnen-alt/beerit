"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";
import { updateProfileAction } from "@/app/settings/actions";
import { INITIAL_ACTION_STATE } from "@/lib/auth/action-state";
import { profileSchema, type ProfileValues } from "@/lib/validation/auth";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsFormProps {
  profile: Profile;
}

function toFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return formData;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );
  const form = useForm<ProfileValues>({
    defaultValues: {
      avatarUrl: profile.avatar_url ?? "",
      bio: profile.bio ?? "",
      username: profile.username,
    },
    resolver: zodResolver(profileSchema),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => action(toFormData(values)));
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register("username")} />
        <p className="text-xs text-destructive">
          {form.formState.errors.username?.message ??
            state.fieldErrors?.username?.[0]}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          placeholder="https://..."
          type="url"
          {...form.register("avatarUrl")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.avatarUrl?.message ??
            state.fieldErrors?.avatarUrl?.[0]}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell your group a little about yourself."
          {...form.register("bio")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.bio?.message ?? state.fieldErrors?.bio?.[0]}
        </p>
      </div>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        <Save className="size-4" />
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
