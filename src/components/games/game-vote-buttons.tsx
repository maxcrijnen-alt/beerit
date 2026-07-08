"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bookmark, Flag, Heart, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import {
  setGameVoteAction,
  submitGameReportAction,
  toggleSavedGameAction,
} from "@/app/games/social-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  reportGameSchema,
  type ReportGameValues,
} from "@/lib/validation/social";
import { logDevelopmentError } from "@/lib/dev-log";
import {
  GAME_REPORT_REASONS,
  type GameSocialState,
  type GameVoteType,
} from "@/types/database";

interface GameVoteButtonsProps {
  canReport: boolean;
  canSave: boolean;
  canVote: boolean;
  dislikes: number;
  gameId: string;
  initialState: GameSocialState;
  isSignedIn: boolean;
  likes: number;
  reports: number;
}

const REPORT_REASON_LABELS: Record<(typeof GAME_REPORT_REASONS)[number], string> = {
  DANGEROUS_CHALLENGE: "Dangerous challenge",
  HARASSMENT: "Harassment",
  HATE: "Hate",
  ILLEGAL_ACTIVITY: "Illegal activity",
  OTHER: "Other",
  REAL_GAMBLING: "Real gambling",
  SELF_HARM: "Self-harm",
  SEXUAL_COERCION: "Sexual pressure or coercion",
  SPAM: "Spam",
  UNDERAGE_DRINKING: "Underage drinking",
};

export function GameVoteButtons({
  canReport,
  canSave,
  canVote,
  dislikes: initialDislikes,
  gameId,
  initialState,
  isSignedIn,
  likes: initialLikes,
  reports: initialReports,
}: GameVoteButtonsProps) {
  const router = useRouter();
  const [currentVote, setCurrentVote] = useState(initialState.vote);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [hasReported, setHasReported] = useState(initialState.hasReported);
  const [isPending, setIsPending] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialState.isSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [message, setMessage] = useState<string | null>(null);
  const [reports, setReports] = useState(initialReports);
  const reportForm = useForm<ReportGameValues>({
    defaultValues: {
      details: "",
      gameId,
      reason: "OTHER",
    },
    resolver: zodResolver(reportGameSchema),
  });

  function applyVoteCounts(previous: GameVoteType | null, next: GameVoteType | null) {
    setLikes((value) =>
      Math.max(0, value - (previous === "LIKE" ? 1 : 0) + (next === "LIKE" ? 1 : 0)),
    );
    setDislikes((value) =>
      Math.max(
        0,
        value - (previous === "DISLIKE" ? 1 : 0) + (next === "DISLIKE" ? 1 : 0),
      ),
    );
  }

  function handleVote(voteType: GameVoteType) {
    setIsPending(true);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await setGameVoteAction(gameId, voteType);

        if (result.status === "success") {
          const nextVote = result.data?.vote ?? null;
          applyVoteCounts(currentVote, nextVote);
          setCurrentVote(nextVote);
          router.refresh();
        }

        setMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not update the game vote.", error);
        setMessage("Could not update your vote. Try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  function handleSave() {
    setIsPending(true);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await toggleSavedGameAction(gameId);

        if (result.status === "success") {
          setIsSaved(result.data?.isSaved ?? false);
          router.refresh();
        }

        setMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not update the saved game.", error);
        setMessage("Could not update your saved games. Try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  function handleReport(values: ReportGameValues) {
    setIsPending(true);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await submitGameReportAction(values);

        if (result.status === "success") {
          setHasReported(true);
          setIsReportOpen(false);
          setReports((value) => value + 1);
          reportForm.reset({ details: "", gameId, reason: "OTHER" });
          router.refresh();
        }

        setMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not submit the game report.", error);
        setMessage("Could not submit your report. Try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          aria-pressed={currentVote === "LIKE"}
          disabled={isPending || !canVote}
          onClick={() => handleVote("LIKE")}
          size="sm"
          variant={currentVote === "LIKE" ? "secondary" : "outline"}
        >
          <Heart className="size-3.5" />
          {likes}
        </Button>
        <Button
          aria-pressed={currentVote === "DISLIKE"}
          disabled={isPending || !canVote}
          onClick={() => handleVote("DISLIKE")}
          size="sm"
          variant={currentVote === "DISLIKE" ? "secondary" : "outline"}
        >
          <ThumbsDown className="size-3.5" />
          {dislikes}
        </Button>
        <Button
          disabled={isPending || !canSave}
          onClick={handleSave}
          size="sm"
          variant={isSaved ? "secondary" : "outline"}
        >
          <Bookmark className="size-3.5" />
          {isSaved ? "Saved" : "Save"}
        </Button>
        <Button
          disabled={isPending || !canReport || hasReported}
          onClick={() => setIsReportOpen((value) => !value)}
          size="sm"
          variant={hasReported ? "secondary" : "outline"}
        >
          <Flag className="size-3.5" />
          {hasReported ? "Reported" : `Report ${reports}`}
        </Button>
      </div>
      {!isSignedIn ? (
        <p className="text-center text-xs text-muted-foreground">
          <Link className="font-medium text-primary underline" href="/auth">
            Sign in or start guest mode
          </Link>{" "}
          to vote and report.
        </p>
      ) : !canSave ? (
        <p className="text-center text-xs text-muted-foreground">
          Guests can vote and report. Create an account to save games.
        </p>
      ) : null}
      {message ? (
        <p aria-live="polite" className="text-center text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
      {isReportOpen ? (
        <form
          className="space-y-3 rounded-xl border border-border p-4"
          onSubmit={reportForm.handleSubmit(handleReport)}
        >
          <div className="space-y-2">
            <Label htmlFor="report-reason">Why are you reporting this game?</Label>
            <Select id="report-reason" {...reportForm.register("reason")}>
              {GAME_REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {REPORT_REASON_LABELS[reason]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              placeholder="Add context for the moderator."
              {...reportForm.register("details")}
            />
            <p className="text-xs text-destructive">
              {reportForm.formState.errors.details?.message}
            </p>
          </div>
          <Button className="w-full" disabled={isPending} type="submit">
            <Flag className="size-4" />
            Submit report
          </Button>
        </form>
      ) : null}
    </section>
  );
}
