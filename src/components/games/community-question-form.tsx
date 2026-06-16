"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tags, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createGameTopicAction,
  submitCommunityGameCardAction,
} from "@/app/games/social-actions";
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
  createGameTopicSchema,
  type CommunityGameCardValues,
  type CreateGameTopicValues,
} from "@/lib/validation/games";
import { Input } from "@/components/ui/input";
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
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicIsPending, setTopicIsPending] = useState(false);
  const [topicMessage, setTopicMessage] = useState<string | null>(null);
  const form = useForm<CommunityGameCardValues>({
    defaultValues: { gameId, intensity: "Funny", text: "", topicId: null },
    resolver: zodResolver(communityGameCardSchema),
  });
  const topicForm = useForm<CreateGameTopicValues>({
    defaultValues: {
      description: "",
      gameId,
      isSpicy: false,
      title: "",
    },
    resolver: zodResolver(createGameTopicSchema),
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

  function handleTopicSubmit(values: CreateGameTopicValues) {
    setTopicIsPending(true);
    setTopicMessage(null);
    startTransition(async () => {
      try {
        const result = await createGameTopicAction(values);

        if (result.status === "success") {
          topicForm.reset({
            description: "",
            gameId,
            isSpicy: false,
            title: "",
          });
          setShowTopicForm(false);
          router.refresh();
        }

        setTopicMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not create a game topic.", error);
        setTopicMessage("Could not add the topic. Try again.");
      } finally {
        setTopicIsPending(false);
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
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Question topics</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Group new questions into packs like Football, Student House,
                    or Spicy.
                  </p>
                </div>
                <Button
                  onClick={() => setShowTopicForm((value) => !value)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {showTopicForm ? <X className="size-3.5" /> : <Tags className="size-3.5" />}
                  {showTopicForm ? "Close" : "New"}
                </Button>
              </div>
              {showTopicForm ? (
                <form
                  className="mt-3 space-y-3"
                  onSubmit={topicForm.handleSubmit(handleTopicSubmit)}
                >
                  <input type="hidden" {...topicForm.register("gameId")} />
                  <div className="space-y-2">
                    <Label htmlFor="community-topic-title">Topic name</Label>
                    <Input
                      id="community-topic-title"
                      placeholder="Football, Student House, Spicy..."
                      {...topicForm.register("title")}
                    />
                    <p className="text-xs text-destructive">
                      {topicForm.formState.errors.title?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community-topic-description">
                      Description
                    </Label>
                    <Textarea
                      id="community-topic-description"
                      placeholder="What kind of questions fit this topic?"
                      {...topicForm.register("description")}
                    />
                    <p className="text-xs text-destructive">
                      {topicForm.formState.errors.description?.message}
                    </p>
                  </div>
                  <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    <input
                      className="mt-1"
                      type="checkbox"
                      {...topicForm.register("isSpicy")}
                    />
                    <span>
                      Mark as Spicy. Spicy topics should stay opt-in for adult
                      groups.
                    </span>
                  </label>
                  {topicMessage ? (
                    <p
                      aria-live="polite"
                      className="text-xs text-muted-foreground"
                    >
                      {topicMessage}
                    </p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={topicIsPending}
                    type="submit"
                    variant="secondary"
                  >
                    <Tags className="size-4" />
                    {topicIsPending ? "Adding topic..." : "Add topic"}
                  </Button>
                </form>
              ) : null}
            </div>

            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
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
          </div>
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
