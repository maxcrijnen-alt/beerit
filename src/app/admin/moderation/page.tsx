import { Eye, EyeOff, Flag, ShieldAlert, ThumbsDown } from "lucide-react";
import { notFound } from "next/navigation";
import { moderateGameAction } from "@/app/games/social-actions";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchModerationQueue } from "@/lib/social/queries";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const viewer = await requireViewer();

  if (viewer.profile?.role !== "ADMIN") {
    notFound();
  }

  const games = await fetchModerationQueue();

  return (
    <AppShell viewer={viewer}>
      <section className="space-y-2">
        <Badge variant="outline">Admin only</Badge>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldAlert className="size-6 text-primary" />
          Moderation
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Review reported or disliked games. Hidden games disappear from public
          browsing until an admin restores them.
        </p>
      </section>
      <section className="mt-5 space-y-3">
        {games.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              No games currently need review.
            </CardContent>
          </Card>
        ) : null}
        {games.map((game) => (
          <Card key={game.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <Badge variant={game.is_hidden ? "secondary" : "outline"}>
                  {game.is_hidden ? "Hidden" : "Visible"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  by {game.creator_username ? `@${game.creator_username}` : "Beerit"}
                </span>
              </div>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription className="flex gap-4">
                <span className="flex items-center gap-1">
                  <Flag className="size-3.5" />
                  {game.reports_count} reports
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="size-3.5" />
                  {game.dislikes_count} dislikes
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {game.reports.length > 0 ? (
                <div className="space-y-2 rounded-lg bg-muted p-3">
                  {game.reports.map((report) => (
                    <div className="text-xs" key={report.id}>
                      <p className="font-semibold">{report.reason.replaceAll("_", " ")}</p>
                      {report.details ? (
                        <p className="mt-1 text-muted-foreground">{report.details}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              <form action={moderateGameAction}>
                <input name="gameId" type="hidden" value={game.id} />
                <input
                  name="hidden"
                  type="hidden"
                  value={game.is_hidden ? "false" : "true"}
                />
                <Button className="w-full" type="submit" variant="outline">
                  {game.is_hidden ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  {game.is_hidden ? "Restore game" : "Hide game"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
