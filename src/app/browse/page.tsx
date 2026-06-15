import { CircleAlert, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { GameBrowser } from "@/components/games/game-browser";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGames } from "@/lib/games/queries";
import { getViewer } from "@/lib/auth/viewer";
import { logDevelopmentError } from "@/lib/dev-log";
import { cn } from "@/lib/utils";
import type { GameSummary, Viewer } from "@/types/database";

export const dynamic = "force-dynamic";

interface BrowseGamesResult {
  games: GameSummary[];
  hasError: boolean;
}

async function getBrowseGames(): Promise<BrowseGamesResult> {
  try {
    return { games: await fetchGames(), hasError: false };
  } catch (error) {
    logDevelopmentError("Could not load browse games.", error);
    return { games: [], hasError: true };
  }
}

function BrowseUnavailable() {
  return (
    <Card>
      <CardHeader>
        <CircleAlert className="size-5 text-destructive" />
        <CardTitle>Games are taking longer to load</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-5 text-muted-foreground">
          Beerit could not reach the game library right now. This can happen
          while the game service is waking up. Try again or return to the start
          screen.
        </p>
        <Link className={cn(buttonVariants(), "w-full")} href="/browse">
          <RotateCcw className="size-4" />
          Try again
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          href="/"
        >
          Back to start
        </Link>
      </CardContent>
    </Card>
  );
}

function BrowseLayout({
  children,
  viewer,
}: {
  children: ReactNode;
  viewer: Viewer | null;
}) {
  if (viewer) {
    return <AppShell viewer={viewer}>{children}</AppShell>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-xl space-y-5">
        <Link className="font-semibold" href="/">
          Beerit
        </Link>
        {children}
      </div>
    </main>
  );
}

export default async function BrowsePage() {
  const [viewer, gamesResult] = await Promise.all([getViewer(), getBrowseGames()]);

  if (gamesResult.hasError) {
    return (
      <BrowseLayout viewer={viewer}>
        <BrowseUnavailable />
      </BrowseLayout>
    );
  }

  const content = (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse games</h1>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Find a game for your group and start a lobby when you are ready.
        </p>
      </div>
      <GameBrowser games={gamesResult.games} />
    </div>
  );

  return <BrowseLayout viewer={viewer}>{content}</BrowseLayout>;
}
