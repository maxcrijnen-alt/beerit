import {
  ArrowRight,
  Gamepad2,
  PlusCircle,
  Search,
  ShieldAlert,
  Shuffle,
  UsersRound,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
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
import { fetchViewerLobbies } from "@/lib/lobbies/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [viewer, lobbies] = await Promise.all([
    requireViewer(),
    fetchViewerLobbies().catch(() => []),
  ]);
  const name = viewer.profile?.username ?? viewer.guestName ?? "friend";
  const activeLobby =
    lobbies.find((lobby) => lobby.status === "ACTIVE") ??
    lobbies.find((lobby) => lobby.status === "WAITING") ??
    null;

  return (
    <AppShell viewer={viewer}>
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-5 shadow-[0_20px_55px_rgba(0,0,0,0.40)]">
        <div className="absolute -right-16 -top-20 size-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 left-6 size-40 rounded-full bg-accent/70 blur-3xl" />
        <div className="relative space-y-3">
          <Badge variant={viewer.isAnonymous ? "secondary" : "outline"}>
            {viewer.isAnonymous ? "Guest mode" : "Registered creator"}
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Start your night, {name}.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Zet in minder dan een minuut je groep, spullen en vibe klaar. Beerit kiest een passende lobby voor one-phone play of meerdere devices.
            </p>
          </div>
          <div className="grid gap-3 pt-2">
            <Link
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
              href="/browse?intent=random"
            >
              <Shuffle className="size-4" />
              Start avond
              <ArrowRight className="ml-auto size-4" />
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full",
                )}
                href="/lobby"
              >
                <Gamepad2 className="size-4" />
                Join code
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full",
                )}
                href="/browse"
              >
                <Search className="size-4" />
                Browse
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] font-medium text-muted-foreground">
              <span className="rounded-2xl border border-border/70 bg-background/70 px-2 py-2">
                Spelers
              </span>
              <span className="rounded-2xl border border-border/70 bg-background/70 px-2 py-2">
                Spullen
              </span>
              <span className="rounded-2xl border border-border/70 bg-background/70 px-2 py-2">
                Vibe
              </span>
            </div>
          </div>
        </div>
      </section>
      {activeLobby ? (
        <section className="mt-4">
          <Link href={`/lobby/${activeLobby.id}`}>
            <Card className="border-primary/40 bg-primary/5 transition hover:border-primary/70">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary">
                    {activeLobby.status === "ACTIVE"
                      ? "Game in progress — jump back in"
                      : "Your lobby is waiting"}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold">
                    {activeLobby.game_title}
                  </p>
                  <p className="mt-0.5 font-mono text-xs tracking-widest text-muted-foreground">
                    {activeLobby.code}
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-primary" />
              </CardContent>
            </Card>
          </Link>
        </section>
      ) : null}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PlusCircle className="size-5" />
            </span>
            <CardTitle>Create games</CardTitle>
            <CardDescription>
              Publish your own party game or remix a community favorite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
              href="/create"
            >
              {viewer.isAnonymous ? "Create an account first" : "Create a game"}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </span>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              {viewer.isAnonymous
                ? "Guest progress stays temporary. Create an account to keep a profile."
                : `${viewer.profile?.total_tokens ?? 0} creator Tokens - fictional points, no real-world value.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
              href="/settings"
            >
              {viewer.isAnonymous ? "View guest limits" : "Edit profile"}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UsersRound className="size-5" />
            </span>
            <CardTitle>Friends</CardTitle>
            <CardDescription>
              {viewer.isAnonymous
                ? "Create an account to keep a friend list."
                : "Compare fictional Beerits across finished lobby sessions."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
              href="/friends"
            >
              {viewer.isAnonymous ? "Create an account first" : "Open friends"}
            </Link>
          </CardContent>
        </Card>
        {viewer.profile?.role === "ADMIN" ? (
          <Card>
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert className="size-5" />
              </span>
              <CardTitle>Moderation</CardTitle>
              <CardDescription>
                Review reports and hide unsafe community games.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
                href="/admin/moderation"
              >
                Open moderation
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>
      <ResponsiblePlayNote className="mt-6" compact />
    </AppShell>
  );
}
