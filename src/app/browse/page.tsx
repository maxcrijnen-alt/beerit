import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { GameBrowser } from "@/components/games/game-browser";
import { fetchGames } from "@/lib/games/queries";
import { getViewer } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const [viewer, games] = await Promise.all([getViewer(), fetchGames()]);
  const content = (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Browse games</h1>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Find a game for your group and start a lobby when you are ready.
        </p>
      </div>
      <GameBrowser games={games} />
    </div>
  );

  if (viewer) {
    return <AppShell viewer={viewer}>{content}</AppShell>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-xl space-y-5">
        <Link className="font-semibold" href="/">
          Beerit
        </Link>
        {content}
      </div>
    </main>
  );
}
