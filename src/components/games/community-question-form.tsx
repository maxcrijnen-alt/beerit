"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { submitCommunityGameCardAction } from "@/app/games/social-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logDevelopmentError } from "@/lib/dev-log";
import {
  communityGameCardSchema,
  type CommunityGameCardValues,
} from "@/lib/validation/games";
import { GAME_INTENSITIES, type GameTopic } from "@/types/database";

interface CommunityQuestionFormProps {
  canSubmit: boolean;
  gameId: string;
  topics?: GameTopic[];
}

export function CommunityQuestionForm({
  canSubmit,
  gameId,
  topics = [],
}: CommunityQuestionFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<CommunityGameCardValues>({
    defaultValues: { gameId, intensity: "Funny", text: "", topicId: null },
    resolver: zodResolver(communityGameCardSchema),
  });

  function handleSubmit(values: CommunityGameCardValues) {
    setIsPending(true);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await submitCommunityGameCardAction(values);

        if (result.status === "success") {
          form.reset({
            gameId,
            intensity: values.intensity,
            text: "",
            topicId: values.topicId ?? null,
          });
          router.refresh();
        }

        setMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not submit a community question.", error);
        setMessage("Could not add your question. Try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a question</CardTitle>
        <CardDescription>
          Everyone can suggest questions. Likes help useful recent questions
          appear more often in new lobbies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canSubmit ? (
          <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
            <input type="hidden" {...form.register("gameId")} />
            {topics.length ? (
              <div className="space-y-2">
                <Label htmlFor="community-topic">Topic</Label>
                <Select
                  id="community-topic"
                  {...form.register("topicId", {
                    setValueAs: (value) => value || null,
                  })}
                >
                  <option value="">No topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                      {topic.is_spicy ? " (18+ opt-in)" : ""}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="community-question">Question</Label>
              <Textarea
                id="community-question"
                placeholder="What should the group answer?"
                {...form.register("text")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.text?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="community-intensity">Intensity</Label>
              <Select id="community-intensity" {...form.register("intensity")}>
                {GAME_INTENSITIES.map((intensity) => (
                  <option key={intensity} value={intensity}>
                    {intensity}
                  </option>
                ))}
              </Select>
            </div>
            {message ? (
              <p aria-live="polite" className="text-xs text-muted-foreground">
                {message}
              </p>
            ) : null}
            <Button className="w-full" disabled={isPending} type="submit">
              <Plus className="size-4" />
              {isPending ? "Adding question..." : "Add question"}
            </Button>
          </form>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            <Link className="font-medium text-primary underline" href="/auth">
              Sign in or start guest mode
            </Link>{" "}
            to add a question.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
