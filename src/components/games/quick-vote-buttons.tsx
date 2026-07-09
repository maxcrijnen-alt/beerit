"use client";

import { Heart, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { setGameVoteAction } from "@/app/games/social-actions";
import { logDevelopmentError } from "@/lib/dev-log";
import type { GameVoteType } from "@/types/database";

interface QuickVoteButtonsProps {
  dislikes: number;
  gameId: string;
  initialVote: GameVoteType | null;
  likes: number;
}

/**
 * Compact like/dislike pair for browse cards. Votes feed weighted random
 * discovery, so quick voting keeps fresh community content surfacing.
 */
export function QuickVoteButtons({
  dislikes: initialDislikes,
  gameId,
  initialVote,
  likes: initialLikes,
}: QuickVoteButtonsProps) {
  const [vote, setVote] = useState<GameVoteType | null>(initialVote);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [pending, setPending] = useState(false);

  async function castVote(nextVote: GameVoteType) {
    if (pending) {
      return;
    }

    const previous = { dislikes, likes, vote };
    const removing = vote === nextVote;

    setPending(true);
    setVote(removing ? null : nextVote);
    setLikes(
      likes +
        (nextVote === "LIKE" ? (removing ? -1 : 1) : vote === "LIKE" ? -1 : 0),
    );
    setDislikes(
      dislikes +
        (nextVote === "DISLIKE"
          ? removing
            ? -1
            : 1
          : vote === "DISLIKE"
            ? -1
            : 0),
    );

    try {
      const result = await setGameVoteAction(gameId, nextVote);

      if (result.status === "error") {
        throw new Error(result.message);
      }
    } catch (error) {
      logDevelopmentError("Could not save the quick vote.", error);
      setVote(previous.vote);
      setLikes(previous.likes);
      setDislikes(previous.dislikes);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Like this game"
        aria-pressed={vote === "LIKE"}
        className={`flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-95 ${
          vote === "LIKE"
            ? "border-primary bg-primary/15 text-primary"
            : "border-border text-muted-foreground"
        }`}
        disabled={pending}
        onClick={() => castVote("LIKE")}
        type="button"
      >
        <Heart
          className={`size-3.5 ${vote === "LIKE" ? "fill-current" : ""}`}
        />
        {likes}
      </button>
      <button
        aria-label="Dislike this game"
        aria-pressed={vote === "DISLIKE"}
        className={`flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-95 ${
          vote === "DISLIKE"
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-border text-muted-foreground"
        }`}
        disabled={pending}
        onClick={() => castVote("DISLIKE")}
        type="button"
      >
        <ThumbsDown
          className={`size-3.5 ${vote === "DISLIKE" ? "fill-current" : ""}`}
        />
        {dislikes}
      </button>
    </div>
  );
}
