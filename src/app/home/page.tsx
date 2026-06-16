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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const timeChips = [
  { label: "≤15 min", href: "/browse?maxDuration=15" },
  { label: "≤30 min", href: "/browse?maxDuration=30" },
  { label: "Any length", href: "/browse" },
] as const;

const vibeChips = [
  { label: "Soft", href: "/browse?intensity=Soft" },
  { label: "Funny", href: "/browse?intensity=Funny" },
  { label: "Spicy", href: "/browse?intensity=Spicy" },
  { label: "Chaos", href: "/browse?intensity=Chaos" },
] as const;

export default async function HomePage() {
  const viewer = await requireViewer();
  const name = viewer.profile?.username ?? viewer.guestName ?? "friend";

  return (
    <AppShell viewer={viewer}>
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-5 shadow-[0_20px_55px_rgba(48,34,18,0.10)]">
        <div className="absolute -right-16 -top-20 size-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 left-6 size-40 rounded-full bg-accent/70 blur-3xl" />
        <div className="relative space-y-4">
          <Badge variant={viewer.isAnonymous ? "secondary" : "outline"}>
            {viewer.isAnonymous ? "Guest mode" : "Registered creator"}
          </Badge>
          <div className="space-y-1.5">
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Start je avond, {name}.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Pick a game, open a lobby, and play on one phone or across
              devices.
            </p>
          </div>
          <Link
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
            href="/browse?intent=random"
          >
            <Shuffle className="size-4" />
            Pick random game
            <ArrowRight className="ml-auto size-4" />
          </Link>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              How much time?
            </p>
            <div className="flex flex-wrap gap-2">
              {timeChips.map(({ href, label }) => (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                  href={href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              What&apos;s the vibe?
            </p>
            <div className="flex flex-wrap gap-2">
              {vibeChips.map(({ href, label }) => (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                  href={href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full",
              )}
              href="/browse"
            >
              <Search className="size-4" />
              Browse all
            </Link>
            <Link
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full",
              )}
              href="/lobby"
            >
              <Gamepad2 className="size-4" />
              Join lobby
            </Link>
          </div>
        </div>
      </section>
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
                : `${viewer.profile?.total_tokens ?? 0} creator Tokens — fictional points, no real-world value.`}
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
