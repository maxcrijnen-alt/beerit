import {
  Clock3,
  Copy,
  ExternalLink,
  Flame,
  ListOrdered,
  Pencil,
  Play,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CommunityQuestionForm } from "@/components/games/community-question-form";
import { CurrentGameCard } from "@/components/games/current-game-card";
import { GameCardVoteButtons } from "@/components/games/game-card-vote-buttons";
import { GameVoteButtons } from "@/components/games/game-vote-buttons";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getViewer } from "@/lib/auth/viewer";
import { fetchGameById } from "@/lib/games/queries";
import {
  fetchGameCardVoteStates,
  fetchGameSocialState,
} from "@/lib/social/queries";
import { cn, toTitleCase } from "@/lib/utils";
import type { GameSocialState } from "@/types/database";

export const dynamic = "force-dynamic";

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

function GameDetailContent({
  canRemix,
  canManage,
  cardVotes,
  currentViewerId,
  game,
  isSignedIn,
  socialState,
}: {
  canRemix: boolean;
  canManage: boolean;
  cardVotes: Record<string, GameSocialState["vote"]>;
  currentViewerId: string | null;
  game: NonNullable<Awaited<ReturnType<typeof fetchGameById>>>;
  isSignedIn: boolean;
  socialState: GameSocialState;
}) {
  const playerRange = game.max_players
    ? `${game.min_players}-${game.max_players}`
    : `${game.min_players}+`;
  const canUseCommunityActions =
    isSignedIn && game.visibility !== "PRIVATE" && !game.is_hidden;

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{game.category}</Badge>
          <Badge variant="outline">{game.intensity}</Badge>
          {game.visibility !== "PUBLIC" ? (
            <Badge variant="outline">{toTitleCase(game.visibility)}</Badge>
          ) : null}
          {game.concept ? (
            <Badge variant="outline">Concept: {game.concept}</Badge>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{game.title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {game.description}
        </p>
        <p className="text-xs text-muted-foreground">
          by {game.creator_username ? `@${game.creator_username}` : "Beerit"}
        </p>
        {game.remixed_from_title ? (
          <p className="text-xs text-muted-foreground">
            Remixed from {game.remixed_from_title}
          </p>
        ) : null}
      </section>
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <UsersRound className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-sm font-semibold">{playerRange}</p>
            <p className="text-[11px] text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock3 className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-sm font-semibold">
              {game.estimated_duration ?? "?"} min
            </p>
            <p className="text-[11px] text-muted-foreground">Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <ListOrdered className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-sm font-semibold">{game.cards_count}</p>
            <p className="text-[11px] text-muted-foreground">Cards</p>
          </CardContent>
        </Card>
      </div>
      <GameVoteButtons
        canReport={canUseCommunityActions}
        canSave={canUseCommunityActions && canRemix}
        canVote={canUseCommunityActions && game.creator_id !== currentViewerId}
        dislikes={game.dislikes_count}
        gameId={game.id}
        initialState={socialState}
        isSignedIn={isSignedIn}
        likes={game.likes_count}
        reports={game.reports_count}
      />
      <section className="grid gap-2 sm:grid-cols-2">
        <Link
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
          href={`/lobby/create/${game.id}`}
        >
          <Play className="size-4" />
          Create lobby
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "w-full",
          )}
          href={canRemix ? `/games/${game.id}/remix` : "/auth"}
          title={canRemix ? undefined : "Create an account to remix this game"}
        >
          <Copy className="size-4" />
          {canRemix ? "Remix game" : "Remix (sign in)"}
        </Link>
        {canManage ? (
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "w-full sm:col-span-2",
            )}
            href={`/games/${game.id}/edit`}
          >
            <Pencil className="size-4" />
            Manage concept and cards
          </Link>
        ) : null}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {game.rules || "No extra rules. Draw cards and keep the group moving."}
          </p>
          {game.rules_url ? (
            <a
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 w-full",
              )}
              href={game.rules_url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Open full beginner guide
            </a>
          ) : null}
        </CardContent>
      </Card>
      {game.topics.length ? (
        <section className="space-y-2">
          <div>
            <h2 className="font-semibold">Topics</h2>
            <p className="text-xs leading-5 text-muted-foreground">
              Add new questions to a topic. Spicy topics stay opt-in for adult
              groups.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {game.topics.map((topic) => (
              <Badge
                key={topic.id}
                variant={topic.is_spicy ? "secondary" : "outline"}
              >
                {topic.is_spicy ? <Flame className="size-3 text-primary" /> : null}
                {topic.title}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Card preview</h2>
          <p className="text-xs text-muted-foreground">
            The lobby will play these in order.
          </p>
        </div>
        {game.cards.map((card) => (
          <div className="space-y-2" key={card.id}>
            <CurrentGameCard card={card} />
            <GameCardVoteButtons
              canVote={canUseCommunityActions}
              cardId={card.id}
              dislikes={card.dislikes_count}
              initialVote={cardVotes[card.id] ?? null}
              likes={card.likes_count}
            />
          </div>
        ))}
      </section>
      <CommunityQuestionForm
        canSubmit={canUseCommunityActions}
        gameId={game.id}
        topics={game.topics}
      />
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Community questions</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Add these when creating a lobby. Questions with many dislikes are
            shown less often and can be hidden automatically.
          </p>
        </div>
        {game.community_cards.length ? (
          game.community_cards.map((card) => (
            <div className="space-y-2" key={card.id}>
              <CurrentGameCard card={card} />
              <GameCardVoteButtons
                canVote={canUseCommunityActions}
                cardId={card.id}
                dislikes={card.dislikes_count}
                initialVote={cardVotes[card.id] ?? null}
                likes={card.likes_count}
              />
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
            No community questions yet. Be the first to suggest one above.
          </p>
        )}
      </section>
      <ResponsiblePlayNote compact />
    </div>
  );
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const [game, viewer] = await Promise.all([fetchGameById(id), getViewer()]);

  if (!game) {
    notFound();
  }

  const [socialState, cardVotes] = await Promise.all([
    fetchGameSocialState(id, viewer),
    fetchGameCardVoteStates(
      [...game.cards, ...game.community_cards].map((card) => card.id),
      viewer,
    ),
  ]);
  const content = (
    <GameDetailContent
      canManage={Boolean(viewer && !viewer.isAnonymous && game.creator_id === viewer.id)}
      canRemix={Boolean(viewer && !viewer.isAnonymous)}
      cardVotes={cardVotes}
      currentViewerId={viewer?.id ?? null}
      game={game}
      isSignedIn={Boolean(viewer)}
      socialState={socialState}
    />
  );

  if (viewer) {
    return <AppShell viewer={viewer}>{content}</AppShell>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-xl space-y-5">
        <Link className="font-semibold" href="/browse">
          Beerit
        </Link>
        {content}
      </div>
    </main>
  );
}
