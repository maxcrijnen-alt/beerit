import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GameForm } from "@/components/games/game-form";
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
import type { GameFormValues } from "@/lib/validation/games";

export const dynamic = "force-dynamic";

interface RemixPageProps {
  params: Promise<{ id: string }>;
}

export default async function RemixPage({ params }: RemixPageProps) {
  const { id } = await params;
  const [viewer, original] = await Promise.all([
    requireViewer(),
    fetchGameById(id),
  ]);

  if (!original) {
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
              Guests can play games, but a permanent creator profile is
              required to publish a remix.
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

  const defaults: GameFormValues = {
    cards: original.cards.map((card) => ({
      activityKind: card.activity_kind,
      beeritsValue: card.beerits_value,
      cardType: card.card_type,
      intensity: card.intensity,
      text: card.text,
      timerBehavior: card.timer_behavior ?? "FIXED",
      timerMaxSeconds: card.timer_max_seconds,
      timerMinSeconds: card.timer_min_seconds,
      timerSeconds: card.timer_seconds,
    })),
    category: original.category,
    concept: original.concept ?? "",
    description: original.description ?? "",
    estimatedDuration: original.estimated_duration ?? 20,
    intensity: original.intensity,
    maxPlayers: original.max_players ?? Math.max(original.min_players, 10),
    minPlayers: original.min_players,
    remixedFromGameId: original.id,
    rules: original.rules ?? "",
    rulesUrl: original.rules_url ?? "",
    title: `Remix of ${original.title}`,
    visibility: "PUBLIC",
  };

  return (
    <AppShell viewer={viewer}>
      <GameForm
        defaultValues={defaults}
        heading={`Remix ${original.title}`}
        submitLabel="Publish remix"
      />
    </AppShell>
  );
}
