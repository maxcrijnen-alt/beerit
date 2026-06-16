import {
  ArrowRight,
  Gamepad2,
  PlusCircle,
  Search,
  ShieldAlert,
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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await requireViewer();
  const name = viewer.profile?.username ?? viewer.guestName ?? "friend";

  return (
    <AppShell viewer={viewer}>
      <section className="space-y-2">
        <Badge variant={viewer.isAnonymous ? "secondary" : "outline"}>
          {viewer.isAnonymous ? "Guest mode" : "Registered creator"}
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Ready to play, {name}?
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Browse a game or enter a lobby code. Every play session runs through
          a live lobby, including one-phone play.
        </p>
      </section>
      <section className="mt-7 grid gap-4">
        <Link className={cn(buttonVariants({ size: "lg" }), "w-full")} href="/browse">
          <Search className="size-4" />
          Browse games
          <ArrowRight className="ml-auto size-4" />
        </Link>
        <Link
          className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full")}
          href="/lobby"
        >
          <Gamepad2 className="size-4" />
          Join a lobby
        </Link>
      </section>
      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <PlusCircle className="size-5 text-primary" />
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
            <UserRound className="size-5 text-primary" />
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              {viewer.isAnonymous
                ? "Guest progress stays temporary."
                : `${viewer.profile?.total_tokens ?? 0} creator Tokens available.`}
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
            <UsersRound className="size-5 text-primary" />
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
              <ShieldAlert className="size-5 text-primary" />
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
