"use client";

import { useMemo, useState } from "react";
import { CommunityQuestionForm } from "@/components/games/community-question-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { GameSummary } from "@/types/database";

interface ContributeHubProps {
  canSubmit: boolean;
  games: Array<Pick<GameSummary, "category" | "id" | "title">>;
}

/**
 * One place to drop a new question into any public game without hunting for
 * the game first. Suggestions land in that game's community pool where other
 * players like, dislike, or report them.
 */
export function ContributeHub({ canSubmit, games }: ContributeHubProps) {
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id ?? "");
  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId) ?? null,
    [games, selectedGameId],
  );

  if (!games.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No public games are available yet. Create the first one!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contribute-game">Which game fits your question?</Label>
        <Select
          id="contribute-game"
          onChange={(event) => setSelectedGameId(event.target.value)}
          value={selectedGameId}
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.title} — {game.category}
            </option>
          ))}
        </Select>
      </div>
      {selectedGame ? (
        <CommunityQuestionForm
          canSubmit={canSubmit}
          gameId={selectedGame.id}
          key={selectedGame.id}
        />
      ) : null}
    </div>
  );
}
