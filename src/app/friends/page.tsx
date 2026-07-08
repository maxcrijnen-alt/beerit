import { Check, LockKeyhole, UserRound, UsersRound, X } from "lucide-react";
import Link from "next/link";
import {
  markFriendBalanceEvenAction,
  removeFriendshipAction,
  respondFriendRequestAction,
} from "@/app/friends/actions";
import { AppShell } from "@/components/app-shell";
import { AddFriendForm } from "@/components/friends/add-friend-form";
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

export default async function FriendsPage() {
  const viewer = await requireViewer();

  if (viewer.isAnonymous || !viewer.profile) {
    return (
      <AppShell viewer={viewer}>
        <Card>
          <CardHeader>
            <LockKeyhole className="size-5 text-primary" />
            <CardTitle>Create an account first</CardTitle>
            <CardDescription>
              Friend lists and long-term Beerits statistics need a permanent
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
            Add registered players and compare fictional Beerits across lobby
            sessions. Lower Beerits is better. There are no stakes or debts.
          </p>
        </section>
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
            <h2 className="font-semibold">Shared standings</h2>
            <p className="text-xs leading-5 text-muted-foreground">
              Totals come from finished cloud lobby rooms where both players
              used registered profiles.
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
                      <p className="text-lg font-semibold">{friend.your_beerits}</p>
                      <p className="text-xs text-muted-foreground">Your Beerits</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-lg font-semibold">
                        {friend.friend_beerits}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Their Beerits
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">
                      Friend Balance
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="font-mono text-lg font-semibold">
                          {friend.your_balance_points > 0 ? "+" : ""}
                          {friend.your_balance_points}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your Balance Points
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-lg font-semibold">
                          {friend.friend_balance_points > 0 ? "+" : ""}
                          {friend.friend_balance_points}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Their Balance Points
                        </p>
                      </div>
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
                      Friend Balance is a fictional friend-group score. It has
                      no monetary value and is not a debt.
                    </p>
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
      </div>
    </AppShell>
  );
}
