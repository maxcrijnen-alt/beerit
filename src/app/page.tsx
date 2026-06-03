import { ArrowRight, Gamepad2, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const benefits = [
  {
    description: "Choose a game and get to the first card quickly.",
    icon: Gamepad2,
    title: "Play instantly",
  },
  {
    description: "Friends join your lobby with one short code.",
    icon: UsersRound,
    title: "Bring your group",
  },
  {
    description: "Registered creators can publish remixes and earn Tokens.",
    icon: Sparkles,
    title: "Create and remix",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-xl space-y-8">
        <section className="space-y-5 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Beerit
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Party games, ready when your group is.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            The party game platform where friends play, create, and remix
            games. Every session runs through a lobby, even when you share one
            phone.
          </p>
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
        </section>
        <section className="grid gap-3">
          {benefits.map(({ description, icon: Icon, title }) => (
            <Card key={title}>
              <CardContent className="flex gap-4 pt-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
        <ResponsiblePlayNote />
      </div>
    </main>
  );
}
