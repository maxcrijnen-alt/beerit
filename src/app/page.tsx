import {
  ArrowRight,
  Gamepad2,
  ListChecks,
  QrCode,
  Shuffle,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const benefits = [
  {
    description: "Choose a game and get to the first card in under a minute.",
    icon: Gamepad2,
    title: "Play instantly",
  },
  {
    description: "Friends join your lobby with one short code — no app required.",
    icon: UsersRound,
    title: "Bring your group",
  },
  {
    description:
      "Registered creators can publish remixes and earn fictional creator Tokens.",
    icon: Sparkles,
    title: "Create and remix",
  },
] as const;

const steps = [
  {
    description: "Browse community games or hit Pick random to skip the scroll.",
    icon: Shuffle,
    label: "Pick a game",
    step: "1",
  },
  {
    description: "A lobby opens in seconds. Share the six-character code with the group.",
    icon: QrCode,
    label: "Open a lobby",
    step: "2",
  },
  {
    description: "Read cards aloud on one phone or connect multiple devices. No setup.",
    icon: ListChecks,
    label: "Play together",
    step: "3",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-foreground">
      <div className="mx-auto max-w-xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-[0_22px_60px_rgba(48,34,18,0.10)]">
          <div className="absolute -right-14 -top-16 size-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 size-44 rounded-full bg-accent/80 blur-3xl" />
          <div className="relative space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Beerit
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Party games, ready when your group is.
              </h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">
                The party game platform where friends play, create, and remix
                games. Every session runs through a lobby — on one phone or
                across devices.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                href="/auth"
              >
                Start playing
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full sm:w-auto",
                )}
                href="/browse"
              >
                Browse games
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <div className="space-y-3">
            {steps.map(({ description, icon: Icon, label, step }) => (
              <div
                className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4"
                key={step}
              >
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/60">
                    {step}
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold">{label}</h3>
                  <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Why Beerit</h2>
          <div className="grid gap-3">
            {benefits.map(({ description, icon: Icon, title }) => (
              <Card key={title}>
                <CardContent className="flex gap-4 pt-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-border/80 bg-card p-4 text-center">
          <p className="text-sm font-semibold">Ready to play?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No account needed to join a lobby or try a game.
          </p>
          <Link
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
            href="/auth"
          >
            Start playing &mdash; it&apos;s free
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ResponsiblePlayNote />
      </div>
    </main>
  );
}
