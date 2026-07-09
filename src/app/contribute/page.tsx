import { Lightbulb, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ContributeHub } from "@/components/games/contribute-hub";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchGames } from "@/lib/games/queries";
import { logDevelopmentError } from "@/lib/dev-log";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContributePage() {
  const viewer = await requireViewer();
  const games = await fetchGames().catch((error) => {
    logDevelopmentError("Could not load games for contribute.", error);
    return [];
  });
  const pickableGames = [...games]
    .sort((a, b) => b.plays_count - a.plays_count)
    .map(({ category, id, title }) => ({ category, id, title }));

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-5">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            Add your ideas
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Beerit stays fresh because players keep adding questions and games.
            Everything you add can be liked, disliked, or reported by others —
            popular ideas show up more often.
          </p>
        </section>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-primary" />
              <CardTitle>Suggest a question</CardTitle>
            </div>
            <CardDescription>
              Drop a question into any public game. Guests can suggest too —
              no account needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContributeHub canSubmit games={pickableGames} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle>Create a whole game</CardTitle>
            </div>
            <CardDescription>
              {viewer.isAnonymous
                ? "Publishing a full game needs a free account, so your creation stays yours."
                : "Publish your own party game or remix a community favorite."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
              href={viewer.isAnonymous ? "/auth" : "/create"}
            >
              <PlusCircle className="size-4" />
              {viewer.isAnonymous ? "Create an account" : "Create a game"}
            </Link>
          </CardContent>
        </Card>
        <ResponsiblePlayNote compact />
      </div>
    </AppShell>
  );
}
