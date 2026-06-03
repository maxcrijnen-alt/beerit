"use client";

import { Heart, ThumbsDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { setGameCardVoteAction } from "@/app/games/social-actions";
import { Button } from "@/components/ui/button";
import { logDevelopmentError } from "@/lib/dev-log";
import type { GameVoteType } from "@/types/database";

interface GameCardVoteButtonsProps {
  canVote: boolean;
  cardId: string;
  compact?: boolean;
  dislikes: number;
  initialVote: GameVoteType | null;
  likes: number;
}

export function GameCardVoteButtons({
  canVote,
  cardId,
  compact = false,
  dislikes: initialDislikes,
  initialVote,
  likes: initialLikes,
}: GameCardVoteButtonsProps) {
  const router = useRouter();
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isPending, setIsPending] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [message, setMessage] = useState<string | null>(null);

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
        const result = await setGameCardVoteAction(cardId, voteType);

        if (result.status === "success") {
          const nextVote = result.data?.vote ?? null;

          applyVoteCounts(currentVote, nextVote);
          setCurrentVote(nextVote);
          router.refresh();
        }

        setMessage(result.message);
      } catch (error) {
        logDevelopmentError("Could not update a card vote.", error);
        setMessage("Could not update your vote. Try again.");
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className={compact ? "flex justify-end gap-2" : "grid grid-cols-2 gap-2"}>
        <Button
          aria-label="Like this card"
          aria-pressed={currentVote === "LIKE"}
          disabled={isPending || !canVote}
          onClick={() => handleVote("LIKE")}
          size={compact ? "icon" : "sm"}
          variant={currentVote === "LIKE" ? "secondary" : "outline"}
        >
          <Heart className="size-3.5" />
          {compact ? <span className="sr-only">Like</span> : likes}
        </Button>
        <Button
          aria-label="Dislike this card"
          aria-pressed={currentVote === "DISLIKE"}
          disabled={isPending || !canVote}
          onClick={() => handleVote("DISLIKE")}
          size={compact ? "icon" : "sm"}
          variant={currentVote === "DISLIKE" ? "secondary" : "outline"}
        >
          <ThumbsDown className="size-3.5" />
          {compact ? <span className="sr-only">Dislike</span> : dislikes}
        </Button>
      </div>
      {message ? (
        <p aria-live="polite" className="text-center text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
