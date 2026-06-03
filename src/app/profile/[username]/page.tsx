import { Gamepad2, Heart, Pencil, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GameCard } from "@/components/games/game-card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { TokenBalance } from "@/components/profile/token-balance";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getViewer } from "@/lib/auth/viewer";
import { fetchGamesByCreator } from "@/lib/games/queries";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { GameSummary, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

const badgePlaceholders = [
  "First Game Created",
  "10 Likes Received",
  "100 Likes Received",
  "1,000 Plays",
  "Remix Master",
  "Chaos Creator",
] as const;

function ProfileContent({
  isOwnProfile,
  games,
  profile,
}: {
  isOwnProfile: boolean;
  games: GameSummary[];
  profile: Profile;
}) {
  return (
    <div className="space-y-5">
      <ProfileHeader profile={profile} />
      {isOwnProfile ? (
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          href="/settings"
        >
          <Pencil className="size-4" />
          Edit profile
        </Link>
      ) : null}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Gamepad2 className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-lg font-semibold">
              {profile.total_games_created}
            </p>
            <p className="text-[11px] text-muted-foreground">Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Heart className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-lg font-semibold">
              {profile.total_likes_received}
            </p>
            <p className="text-[11px] text-muted-foreground">Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Sparkles className="mx-auto size-4 text-primary" />
            <p className="mt-2 text-lg font-semibold">{profile.total_tokens}</p>
            <p className="text-[11px] text-muted-foreground">Tokens</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Creator rewards
            <TokenBalance value={profile.total_tokens} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-5 text-muted-foreground">
            Tokens are non-transferable creator points with no real-world value.
            A creator earns one Token when their game receives a like.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Badge placeholders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {badgePlaceholders.map((badge) => (
            <span
              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
              key={badge}
            >
              {badge}
            </span>
          ))}
        </CardContent>
      </Card>
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Created games</h2>
          <p className="text-xs text-muted-foreground">
            {games.length === 0
              ? "No visible games yet."
              : `${games.length} ${games.length === 1 ? "game" : "games"} available.`}
          </p>
        </div>
        {games.map((game) => (
          <GameCard game={game} key={game.id} />
        ))}
      </section>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle<Profile>();

  if (!profile) {
    notFound();
  }

  const [viewer, games] = await Promise.all([
    getViewer(),
    fetchGamesByCreator(profile.id),
  ]);
  const content = (
    <ProfileContent
      games={games}
      isOwnProfile={viewer?.id === profile.id}
      profile={profile}
    />
  );

  if (viewer) {
    return <AppShell viewer={viewer}>{content}</AppShell>;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-xl">{content}</div>
    </main>
  );
}
