import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AddGameCardsForm } from "@/components/games/add-game-cards-form";
import { CurrentGameCard } from "@/components/games/current-game-card";
import { GameConceptForm } from "@/components/games/game-concept-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchGameById } from "@/lib/games/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface EditGamePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: EditGamePageProps) {
  const { id } = await params;
  const [viewer, game] = await Promise.all([
    requireViewer(),
    fetchGameById(id),
  ]);

  if (!game || (!viewer.isAnonymous && game.creator_id !== viewer.id)) {
    notFound();
  }

  if (viewer.isAnonymous) {
    return (
      <AppShell viewer={viewer}>
        <Card>
          <CardHeader>
            <LockKeyhole className="size-5 text-primary" />
            <CardTitle>Create an account first</CardTitle>
            <CardDescription>
              Guests can play and vote, but only registered creators can
              manage game concepts and add cards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants(), "w-full")} href="/auth">
              Create an account
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-5">
        <div className="space-y-3">
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            href={`/games/${game.id}`}
          >
            <ArrowLeft className="size-4" />
            Back to game
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Manage {game.title}
            </h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Add your own concept and expand the game with new cards.
            </p>
          </div>
        </div>
        <GameConceptForm concept={game.concept} gameId={game.id} />
        <AddGameCardsForm cardsCount={game.cards.length} gameId={game.id} />
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Existing cards</h2>
            <p className="text-xs text-muted-foreground">
              The game currently contains {game.cards.length} official cards.
            </p>
          </div>
          {game.cards.map((card) => (
            <CurrentGameCard card={card} key={card.id} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
