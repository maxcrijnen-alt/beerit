import { Check, LockKeyhole, Trophy, UserRound, UsersRound, X } from "lucide-react";
import Link from "next/link";
import {
  markFriendBalanceEvenAction,
  removeFriendshipAction,
  respondFriendRequestAction,
} from "@/app/friends/actions";
import { AppShell } from "@/components/app-shell";
import { AddFriendForm } from "@/components/friends/add-friend-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchFriendStandings } from "@/lib/friends/queries";
import { cn } from "@/lib/utils";
import type { FriendStanding } from "@/types/database";

export const dynamic = "force-dynamic";

type FriendsTab = "friends" | "balance";

interface FriendsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

function getBalancePoints(friend: FriendStanding) {
  // Placement-based zero-sum Balance Points from finished lobbies (computed
  // server-side, multiplied by each lobby's host-set balance weight);
  // positive means the viewer is ahead of this friend.
  return (
    Math.round(
      (friend.your_balance_points - friend.friend_balance_points) * 10,
    ) / 10
  );
}

function getBalanceStatus(points: number, otherLabel: string) {
  const absPoints = Math.abs(points);

  if (points === 0) {
    return {
      badge: "Even",
      className: "border-border bg-secondary text-secondary-foreground",
      description: "Jullie Friend Balance staat gelijk. Perfect moment voor een rematch.",
      headline: "Helemaal gelijk",
    };
  }

  if (points > 0) {
    return {
      badge: "+" + absPoints,
      className: "border-primary/30 bg-primary/10 text-primary",
      description: `Jij staat ${absPoints} Balance Points voor. Balance Points zijn alleen een fictieve rematch-stand.`,
      headline: "Jij staat voor",
    };
  }

  return {
    badge: "-" + absPoints,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
    description: `${otherLabel} staat ${absPoints} Balance Points voor. Daag ze uit voor een nieuwe avond.`,
    headline: "Rematch ligt klaar",
  };
}

function FriendshipActions({
  friendship,
}: {
  friendship: FriendStanding;
}) {
  if (friendship.status === "PENDING" && friendship.direction === "INCOMING") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <form action={respondFriendRequestAction}>
          <input name="accept" type="hidden" value="true" />
          <input name="friendshipId" type="hidden" value={friendship.friendship_id} />
          <Button className="w-full" size="sm" type="submit">
            <Check className="size-4" />
            Accept
          </Button>
        </form>
        <form action={respondFriendRequestAction}>
          <input name="accept" type="hidden" value="false" />
          <input name="friendshipId" type="hidden" value={friendship.friendship_id} />
          <Button className="w-full" size="sm" type="submit" variant="outline">
            <X className="size-4" />
            Decline
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={removeFriendshipAction}>
      <input name="friendshipId" type="hidden" value={friendship.friendship_id} />
      <Button className="w-full" size="sm" type="submit" variant="outline">
        {friendship.status === "PENDING" ? "Cancel request" : "Remove friend"}
      </Button>
    </form>
  );
}

function FriendTabs({ activeTab }: { activeTab: FriendsTab }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/40 p-1">
      <Link
        className={cn(
          buttonVariants({ variant: activeTab === "friends" ? "default" : "ghost" }),
          "h-11",
        )}
        href="/friends"
      >
        <UsersRound className="size-4" />
        Friends
      </Link>
      <Link
        className={cn(
          buttonVariants({ variant: activeTab === "balance" ? "default" : "ghost" }),
          "h-11",
        )}
        href="/friends?tab=balance"
      >
        <Trophy className="size-4" />
        Balance
      </Link>
    </div>
  );
}

function FriendBalancePanel({ friends }: { friends: FriendStanding[] }) {
  const playedFriends = friends.filter((friend) => friend.shared_lobbies > 0);
  const groupBalancePoints = playedFriends.reduce(
    (total, friend) => total + getBalancePoints(friend),
    0,
  );
  const groupSharedLobbies = playedFriends.reduce(
    (total, friend) => total + friend.shared_lobbies,
    0,
  );
  const groupStatus = getBalanceStatus(groupBalancePoints, "Je vriendengroep");

  if (!friends.length) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
          <p>No accepted friends yet.</p>
          <Link className={cn(buttonVariants(), "w-full")} href="/friends">
            Add friends first
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UsersRound className="size-5 text-primary" />
                Alle gespeelde vrienden
              </CardTitle>
              <CardDescription>
                Automatische vriendengroep van accepted friends waarmee je een
                avond hebt afgesloten.
              </CardDescription>
            </div>
            <Badge className={groupStatus.className} variant="outline">
              {groupStatus.badge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {playedFriends.length ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-lg font-semibold">{playedFriends.length}</p>
                  <p className="text-[11px] text-muted-foreground">Friends</p>
                </div>
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-lg font-semibold">{groupSharedLobbies}</p>
                  <p className="text-[11px] text-muted-foreground">Avonden</p>
                </div>
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-lg font-semibold">
                    {groupBalancePoints > 0 ? "+" : ""}
                    {groupBalancePoints}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Balance Points</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <p className="text-sm font-semibold">{groupStatus.headline}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {groupStatus.description}
                </p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Beerits blijven de eindscore van een losse avond. Friend Balance
                gebruikt aparte Balance Points voor rematches over meerdere
                avonden. Geen geld, geen alcohol, geen uitbetaling en geen echte
                waarde.
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Je hebt al friends, maar nog geen afgesloten avonden met ze. Start
              een avond en sluit de lobby af om hier Balance Points te zien.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="font-semibold">Per vriend</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Balance Points zijn een fictieve rematch-stand. Beerits zelf blijven
            alleen de score van de avond.
          </p>
        </div>
        {playedFriends.length ? (
          playedFriends.map((friend) => {
            const balancePoints = getBalancePoints(friend);
            const status = getBalanceStatus(
              balancePoints,
              `@${friend.friend_username}`,
            );

            return (
              <Card key={friend.friendship_id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <UserRound className="size-4 text-primary" />
                        @{friend.friend_username}
                      </CardTitle>
                      <CardDescription>
                        {friend.shared_lobbies} afgesloten{" "}
                        {friend.shared_lobbies === 1 ? "avond" : "avonden"}
                      </CardDescription>
                    </div>
                    <Badge className={status.className} variant="outline">
                      {status.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-lg font-semibold">
                        {balancePoints > 0 ? "+" : ""}
                        {balancePoints}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance Points
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-lg font-semibold">
                        {Math.abs(friend.your_beerits - friend.friend_beerits)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avondscore verschil
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/35 p-3">
                    <p className="text-sm font-semibold">{status.headline}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {status.description}
                    </p>
                  </div>
                  <form action={markFriendBalanceEvenAction}>
                    <input
                      name="friendshipId"
                      type="hidden"
                      value={friend.friendship_id}
                    />
                    <Button
                      className="w-full"
                      size="sm"
                      type="submit"
                      variant="outline"
                    >
                      Mark as even
                    </Button>
                  </form>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Friend Balance is een fictieve vriendengroep-score zonder
                    geldwaarde en zonder schuld. De host kiest per lobby een
                    avondgewicht (×0 t/m ×3) dat bepaalt hoeveel de avond
                    meetelt, en Mark as even reset de stand voor jullie
                    allebei.
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nog geen gedeelde afgesloten avonden met je friends.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const viewer = await requireViewer();
  const { tab } = await searchParams;
  const activeTab: FriendsTab = tab === "balance" ? "balance" : "friends";

  if (viewer.isAnonymous || !viewer.profile) {
    return (
      <AppShell viewer={viewer}>
        <Card>
          <CardHeader>
            <LockKeyhole className="size-5 text-primary" />
            <CardTitle>Create an account first</CardTitle>
            <CardDescription>
              Friend lists and long-term Balance Points need a permanent
              profile. Tokens are not used as stakes or transferred between
              players.
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

  const friendships = await fetchFriendStandings();
  const accepted = friendships.filter((friend) => friend.status === "ACCEPTED");
  const pending = friendships.filter((friend) => friend.status === "PENDING");

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-5">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Friends</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add registered players and keep a fictional Friend Balance for
            rematches. Beerits remain the final score of one evening.
          </p>
        </section>
        <FriendTabs activeTab={activeTab} />

        {activeTab === "balance" ? (
          <FriendBalancePanel friends={accepted} />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Add a friend</CardTitle>
                <CardDescription>Use their Beerit username.</CardDescription>
              </CardHeader>
              <CardContent>
                <AddFriendForm />
              </CardContent>
            </Card>
            {pending.length ? (
              <section className="space-y-3">
                <h2 className="font-semibold">Requests</h2>
                {pending.map((friend) => (
                  <Card key={friend.friendship_id}>
                    <CardContent className="space-y-3 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <UserRound className="size-4 text-primary" />
                        @{friend.friend_username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {friend.direction === "INCOMING"
                          ? "Sent you a friend request."
                          : "Waiting for a response."}
                      </p>
                      <FriendshipActions friendship={friend} />
                    </CardContent>
                  </Card>
                ))}
              </section>
            ) : null}
            <section className="space-y-3">
              <div>
                <h2 className="font-semibold">Finished evening stats</h2>
                <p className="text-xs leading-5 text-muted-foreground">
                  Beerits shown here are source stats from finished lobbies, not
                  the Friend Balance itself.
                </p>
              </div>
              {accepted.length ? (
                accepted.map((friend) => (
                  <Card key={friend.friendship_id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <UsersRound className="size-4 text-primary" />
                        @{friend.friend_username}
                      </CardTitle>
                      <CardDescription>
                        {friend.shared_lobbies} shared finished{" "}
                        {friend.shared_lobbies === 1 ? "lobby" : "lobbies"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-lg bg-secondary p-3">
                          <p className="text-lg font-semibold">
                            {friend.your_beerits}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Your evening score total
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary p-3">
                          <p className="text-lg font-semibold">
                            {friend.friend_beerits}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Their evening score total
                          </p>
                        </div>
                      </div>
                      <FriendshipActions friendship={friend} />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    No accepted friends yet.
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
