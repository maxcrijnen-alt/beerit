import { Gamepad2, UsersRound } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LobbyJoinForm } from "@/components/lobbies/lobby-join-form";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchViewerLobbies } from "@/lib/lobbies/queries";

export const dynamic = "force-dynamic";

interface LobbyPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function LobbyPage({ searchParams }: LobbyPageProps) {
  const [{ code }, viewer, lobbies] = await Promise.all([
    searchParams,
    requireViewer(),
    fetchViewerLobbies(),
  ]);
  const initialCode = (code ?? "").slice(0, 6).toUpperCase();

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-5">
        <section>
          <Badge variant="secondary">Live gameplay</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Lobby</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Join friends with a six-character code or open one of your recent
            lobby rooms.
          </p>
        </section>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-5 text-primary" />
              <CardTitle>Join a lobby</CardTitle>
            </div>
            <CardDescription>
              {initialCode
                ? "A lobby code was shared with you and is ready below."
                : "Guests and registered players can both join waiting rooms."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LobbyJoinForm initialCode={initialCode} />
          </CardContent>
        </Card>
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Recent lobby rooms</h2>
            <p className="text-xs text-muted-foreground">
              Lobby rooms stay available so the final scoreboard can be viewed.
            </p>
          </div>
          {lobbies.length ? (
            lobbies.map((lobby) => (
              <Link href={`/lobby/${lobby.id}`} key={lobby.id}>
                <Card
                  className={
                    lobby.status === "ACTIVE"
                      ? "border-primary/40 transition hover:border-primary/70"
                      : "transition hover:border-primary/40"
                  }
                >
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {lobby.game_title}
                      </p>
                      <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground">
                        {lobby.code}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge
                        variant={
                          lobby.status === "ACTIVE" ? "default" : "outline"
                        }
                      >
                        {lobby.status === "WAITING"
                          ? "Waiting room"
                          : lobby.status === "ACTIVE"
                            ? "Playing"
                            : "Finished"}
                      </Badge>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <UsersRound className="size-3" />
                        {lobby.players_count}{" "}
                        {lobby.players_count === 1 ? "player" : "players"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-muted-foreground">
                  No lobby rooms yet.
                </p>
                <Link
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full")}
                  href="/browse"
                >
                  Browse games to create one
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
        <ResponsiblePlayNote compact />
      </div>
    </AppShell>
  );
}
