import { ArrowLeft, Gamepad2, Smartphone, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LobbyCreateForm } from "@/components/lobbies/lobby-create-form";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { Badge } from "@/components/ui/badge";
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

interface LobbyCreatePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function LobbyCreatePage({
  params,
}: LobbyCreatePageProps) {
  const { gameId } = await params;
  const [viewer, game] = await Promise.all([
    requireViewer(),
    fetchGameById(gameId),
  ]);

  if (!game) {
    notFound();
  }

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-5">
        <Link
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "-ml-3")}
          href={`/games/${game.id}`}
        >
          <ArrowLeft className="size-4" />
          Back to game
        </Link>
        <section>
          <Badge variant="secondary">{game.category}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Create lobby
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Start a room for {game.title}. Every play session runs through a
            lobby, including one-phone play.
          </p>
        </section>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-5 text-primary" />
              <CardTitle>{game.title}</CardTitle>
            </div>
            <CardDescription>
              A lobby code is created automatically. Share it when friends want
              to join from their own phones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Smartphone className="size-4 text-primary" />
                One-phone ready
              </p>
              <p className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <UsersRound className="size-4 text-primary" />
                Guests welcome
              </p>
            </div>
            <LobbyCreateForm baseCategory={game.category} gameId={game.id} />
          </CardContent>
        </Card>
        <ResponsiblePlayNote compact />
      </div>
    </AppShell>
  );
}
