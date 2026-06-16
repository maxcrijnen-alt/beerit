"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Crown,
  FastForward,
  Flag,
  MessageCircle,
  Minus,
  Play,
  Plus,
  Send,
  UsersRound,
} from "lucide-react";
import {
  type FormEvent,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  adjustBeeritsAction,
  controlLobbyAction,
  leaveLobbyAction,
  scoreAndAdvanceLobbyAction,
  sendLobbyMessageAction,
} from "@/app/lobby/actions";
import { CurrentGameCard } from "@/components/games/current-game-card";
import { GameCardVoteButtons } from "@/components/games/game-card-vote-buttons";
import { BombModeTimer } from "@/components/lobbies/bomb-mode-timer";
import { PostGameActions } from "@/components/lobbies/post-game-actions";
import { TimedEventTimer } from "@/components/lobbies/timed-event-timer";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withTimeout } from "@/lib/async/with-timeout";
import { getViewerDisplayName } from "@/lib/auth/display-name";
import { logDevelopmentError } from "@/lib/dev-log";
import {
  fetchLobby,
  fetchLobbyMessages,
  fetchLobbyPlayers,
} from "@/lib/lobbies/queries-client";
import { createClient } from "@/lib/supabase/client";
import type {
  LobbyControl,
  LobbyRoomData,
  Viewer,
} from "@/types/database";

interface LobbyRoomProps {
  initialRoom: LobbyRoomData;
  viewer: Viewer;
}

type LobbyMutation = (formData: FormData) => Promise<{
  message?: string;
  status: "error" | "idle" | "success";
}>;

const REALTIME_TIMEOUT_MS = 6000;

export function LobbyRoom({ initialRoom, viewer }: LobbyRoomProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const lobbyId = initialRoom.lobby.id;
  const displayName = getViewerDisplayName(viewer);
  const [draft, setDraft] = useState("");
  const [onlineSessionIds, setOnlineSessionIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mutationMessage, setMutationMessage] = useState<string | null>(null);
  const [explodedBombCardId, setExplodedBombCardId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const lobbyQuery = useQuery({
    initialData: initialRoom.lobby,
    queryFn: () => fetchLobby(lobbyId),
    queryKey: ["lobby", lobbyId],
  });
  const playersQuery = useQuery({
    initialData: initialRoom.players,
    queryFn: () => fetchLobbyPlayers(lobbyId),
    queryKey: ["lobby-players", lobbyId],
  });
  const messagesQuery = useQuery({
    initialData: initialRoom.messages,
    queryFn: () => fetchLobbyMessages(lobbyId),
    queryKey: ["lobby-messages", lobbyId],
  });
  const lobby = lobbyQuery.data;
  const players = [...playersQuery.data].sort((a, b) => b.beerits - a.beerits);
  const messages = messagesQuery.data;
  const currentCard = initialRoom.cards[lobby.current_card_index] ?? null;
  const currentCardId = currentCard?.id ?? null;
  const isBombModeCard = currentCard?.timer_behavior === "RANDOM_BOMB";
  const hasBombTimerRange = Boolean(
    currentCard?.timer_min_seconds && currentCard.timer_max_seconds,
  );
  const quickScoreBeerits = currentCard ? Math.max(1, currentCard.beerits_value) : 1;
  const canQuickScore =
    !isBombModeCard || !hasBombTimerRange || explodedBombCardId === currentCardId;
  const isHost = lobby.host_session_user_id === viewer.id;
  const onlineSet = new Set(onlineSessionIds);

  const handleBombExplodedChange = useCallback(
    (exploded: boolean) => {
      setExplodedBombCardId(exploded && currentCardId ? currentCardId : null);
    },
    [currentCardId],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const realtimeClient = supabase;
    let cancelled = false;
    const channel = realtimeClient
      .channel(`lobby-room:${lobbyId}`, {
        config: { presence: { key: viewer.id } },
      })
      .on("presence", { event: "sync" }, () => {
        setOnlineSessionIds(Object.keys(channel.presenceState()));
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          filter: `id=eq.${lobbyId}`,
          schema: "public",
          table: "lobbies",
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["lobby", lobbyId] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `lobby_id=eq.${lobbyId}`,
          schema: "public",
          table: "lobby_players",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["lobby-players", lobbyId],
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `lobby_id=eq.${lobbyId}`,
          schema: "public",
          table: "lobby_messages",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["lobby-messages", lobbyId],
          });
        },
      );

    async function subscribe() {
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(
          realtimeClient.auth.getSession(),
          REALTIME_TIMEOUT_MS,
          "Realtime session lookup timed out.",
        );

        if (error) {
          throw error;
        }

        if (!session?.access_token) {
          setMutationMessage(
            "Your session expired. Return to the start screen to use guest mode or sign in again.",
          );
          return;
        }

        await withTimeout(
          realtimeClient.realtime.setAuth(session.access_token),
          REALTIME_TIMEOUT_MS,
          "Realtime authorization timed out.",
        );

        if (cancelled) {
          return;
        }

        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            void channel.track({
              display_name: displayName,
              online_at: new Date().toISOString(),
              session_user_id: viewer.id,
            });
          }
        });
      } catch (error) {
        logDevelopmentError("Could not connect lobby realtime updates.", error);

        if (!cancelled) {
          setMutationMessage(
            "Live lobby updates could not connect. Reload the page to try again.",
          );
        }
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      void channel.untrack();
      void realtimeClient.removeChannel(channel);
    };
  }, [displayName, lobbyId, queryClient, supabase, viewer.id]);

  function runMutation(
    action: LobbyMutation,
    formData: FormData,
    onSuccess?: () => void,
  ) {
    setPending(true);
    setMutationMessage(null);
    startTransition(async () => {
      try {
        const result = await action(formData);

        if (result.status === "error") {
          setMutationMessage(result.message ?? "Try again.");
        } else {
          onSuccess?.();
        }
      } catch (error) {
        logDevelopmentError("Could not update the lobby.", error);
        setMutationMessage("Could not update the lobby. Try again.");
      } finally {
        setPending(false);
      }
    });
  }

  function runControl(control: LobbyControl) {
    const formData = new FormData();

    formData.set("control", control);
    formData.set("lobbyId", lobbyId);
    runMutation(controlLobbyAction, formData);
  }

  function adjustScore(playerId: string, delta: number) {
    const formData = new FormData();

    formData.set("delta", String(delta));
    formData.set("lobbyId", lobbyId);
    formData.set("playerId", playerId);
    runMutation(adjustBeeritsAction, formData);
  }

  function scoreAndAdvance(playerId: string, delta: number) {
    const formData = new FormData();

    formData.set("delta", String(delta));
    formData.set("lobbyId", lobbyId);
    formData.set("playerId", playerId);
    runMutation(scoreAndAdvanceLobbyAction, formData);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();

    formData.set("lobbyId", lobbyId);
    formData.set("message", draft);
    runMutation(sendLobbyMessageAction, formData, () => setDraft(""));
  }

  function leaveLobby() {
    const formData = new FormData();

    formData.set("lobbyId", lobbyId);
    runMutation(leaveLobbyAction, formData);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(lobby.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      logDevelopmentError("Could not copy the lobby code.", error);
      setMutationMessage("Could not copy the lobby code.");
    }
  }

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{lobby.status === "WAITING" ? "Waiting room" : lobby.status === "ACTIVE" ? "Playing" : "Finished"}</Badge>
            <Badge variant="outline">{players.length} players</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            {initialRoom.game.title}
          </h1>
        </div>
        <Button aria-label="Copy lobby code" onClick={copyCode} variant="outline">
          {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
          <span className="font-mono tracking-widest">{lobby.code}</span>
        </Button>
      </section>

      {mutationMessage ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {mutationMessage}
        </p>
      ) : null}

      {lobby.status === "WAITING" ? (
        <Card>
          <CardHeader>
            <CardTitle>Waiting room</CardTitle>
            <CardDescription>
              Share the lobby code with your group — or start immediately for one-phone play. Everyone joins the same waiting room before the first card appears.
            </CardDescription>
          </CardHeader>
          {isHost ? (
            <CardContent>
              <Button
                className="w-full"
                disabled={pending}
                onClick={() => runControl("START")}
                size="lg"
              >
                <Play className="size-4" />
                Start game
              </Button>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Waiting for the host to start the game.
              </p>
            </CardContent>
          )}
        </Card>
      ) : null}

      {lobby.status === "ACTIVE" ? (
        <section className="space-y-3">
          {currentCard ? (
            <div
              className="animate-in space-y-2 fade-in slide-in-from-right-2 duration-300"
              key={currentCard.id}
            >
              <CurrentGameCard
                card={currentCard}
                label={`Card ${lobby.current_card_index + 1} of ${initialRoom.cards.length}`}
              />
              {currentCard.timer_behavior === "RANDOM_BOMB" &&
              hasBombTimerRange ? (
                <BombModeTimer
                  isHost={isHost}
                  key={`${currentCard.id}:bomb:${currentCard.timer_min_seconds}:${currentCard.timer_max_seconds}:${isHost}`}
                  maxSeconds={currentCard.timer_max_seconds ?? 180}
                  minSeconds={currentCard.timer_min_seconds ?? 20}
                  onExplodedChange={handleBombExplodedChange}
                />
              ) : currentCard.timer_seconds ? (
                <TimedEventTimer
                  key={`${currentCard.id}:${currentCard.timer_seconds}`}
                  label="Round timer"
                  seconds={currentCard.timer_seconds}
                />
              ) : null}
              <GameCardVoteButtons
                canVote
                cardId={currentCard.id}
                compact
                dislikes={currentCard.dislikes_count}
                initialVote={initialRoom.card_votes[currentCard.id] ?? null}
                key={currentCard.id}
                likes={currentCard.likes_count}
              />
            </div>
          ) : (
            <Card className="border-primary/30 bg-accent/30">
              <CardContent className="p-5 text-sm text-muted-foreground">
                This game does not contain a playable card.
              </CardContent>
            </Card>
          )}
          {isHost && currentCard ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isBombModeCard ? "Who held it?" : "Quick result"}
                </CardTitle>
                <CardDescription>
                  {isBombModeCard && !canQuickScore
                    ? "Wait for BOOM, then tap the player who held it."
                    : `Tap the player who loses this round (+${quickScoreBeerits} Beerit${quickScoreBeerits !== 1 ? "s" : ""}). Adjust individually below for multi-place results.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {players.map((player) => (
                  <Button
                    className="min-h-12"
                    disabled={pending || !canQuickScore}
                    key={player.id}
                    onClick={() =>
                      scoreAndAdvance(player.id, quickScoreBeerits)
                    }
                    variant="secondary"
                  >
                    {player.display_name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
          {isHost ? (
            <div className="grid grid-cols-4 gap-2">
              <Button
                className="flex-col gap-0.5 text-xs"
                disabled={pending || lobby.current_card_index === 0}
                onClick={() => runControl("PREVIOUS")}
                size="sm"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
                Undo
              </Button>
              <Button
                className="flex-col gap-0.5 text-xs"
                disabled={pending}
                onClick={() => runControl("SKIP")}
                size="sm"
                variant="outline"
              >
                <FastForward className="size-4" />
                Skip
              </Button>
              <Button
                className="flex-col gap-0.5 text-xs"
                disabled={pending}
                onClick={() => runControl("END")}
                size="sm"
                variant="outline"
              >
                <Flag className="size-4" />
                Stop
              </Button>
              <Button
                className="flex-col gap-0.5 text-xs"
                disabled={pending}
                onClick={() => runControl("NEXT")}
                size="sm"
              >
                <ArrowRight className="size-4" />
                Next
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {lobby.status === "FINISHED" ? (
        <section className="space-y-3">
          <Card className="border-primary/30 bg-accent/20">
            <CardHeader>
              <CardTitle>Evening summary</CardTitle>
              <CardDescription>
                {players[0]
                  ? `${players[0].display_name} finishes with the fewest Beerits.`
                  : "No scores recorded."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {players.map((player, i) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  key={player.id}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-5 text-center text-sm font-mono text-muted-foreground">
                      {i + 1}.
                    </span>
                    <p className="truncate text-sm font-semibold">
                      {player.display_name}
                    </p>
                    {i === 0 ? <Crown className="size-3 shrink-0 text-primary" /> : null}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold">
                    {player.beerits} {player.beerits === 1 ? "Beerit" : "Beerits"}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted-foreground leading-5">
                Beerits zijn fictieve strafpunten. Geen schulden, geen geld, geen verrekening.
              </p>
            </CardContent>
          </Card>
          <PostGameActions gameId={initialRoom.game.id} />
        </section>
      ) : null}

      {lobby.status !== "FINISHED" ? <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UsersRound className="size-4 text-primary" />
              <CardTitle>Scoreboard</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">Fictieve Beerits</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.map((player) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              key={player.id}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">
                  {player.is_host ? <Crown className="size-3 text-primary" /> : null}
                  {player.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {onlineSet.has(player.session_user_id) ? "Online" : "Not connected"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isHost && lobby.status === "ACTIVE" ? (
                  <Button
                    aria-label={`Remove one Beerit from ${player.display_name}`}
                    disabled={pending || player.beerits === 0}
                    onClick={() => adjustScore(player.id, -1)}
                    size="icon"
                    variant="outline"
                  >
                    <Minus className="size-4" />
                  </Button>
                ) : null}
                <span className="min-w-8 text-center font-mono text-sm font-semibold">
                  {player.beerits}
                </span>
                {isHost && lobby.status === "ACTIVE" ? (
                  <Button
                    aria-label={`Add one Beerit to ${player.display_name}`}
                    disabled={pending}
                    onClick={() => adjustScore(player.id, 1)}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card> : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" />
            <CardTitle>Lobby chat</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {messages.length ? (
              messages.map((message) => (
                <div className="rounded-lg bg-secondary p-3" key={message.id}>
                  <p className="text-xs font-semibold">{message.display_name}</p>
                  <p className="mt-1 text-sm">{message.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No messages yet. Keep chat limited to the lobby group.
              </p>
            )}
          </div>
          <form className="flex gap-2" onSubmit={sendMessage}>
            <Input
              aria-label="Lobby message"
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message the lobby"
              value={draft}
            />
            <Button aria-label="Send message" disabled={pending || !draft.trim()} size="icon" type="submit">
              <Send className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {lobby.status === "WAITING" && !isHost ? (
        <Button
          className="w-full"
          disabled={pending}
          onClick={leaveLobby}
          variant="outline"
        >
          Leave lobby
        </Button>
      ) : null}

      <ResponsiblePlayNote compact />
    </div>
  );
}
