import { LockKeyhole } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const viewer = await requireViewer();

  return (
    <AppShell viewer={viewer}>
      {viewer.isAnonymous ? (
        <Card>
          <CardHeader>
            <LockKeyhole className="size-5 text-primary" />
            <CardTitle>Create an account first</CardTitle>
            <CardDescription>
              Guests can play and vote, but only registered creators can
              publish games and earn fictional creator Tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants(), "w-full")} href="/auth">
              Create an account
            </Link>
          </CardContent>
        </Card>
      ) : (
        <GameForm />
      )}
    </AppShell>
  );
}
