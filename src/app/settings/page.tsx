import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/profile/settings-form";
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

export default async function SettingsPage() {
  const viewer = await requireViewer();

  return (
    <AppShell viewer={viewer}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your Beerit profile and account details.
        </p>
      </div>
      {viewer.isAnonymous || !viewer.profile ? (
        <Card className="mt-5">
          <CardHeader>
            <LockKeyhole className="size-5 text-primary" />
            <CardTitle>Guest mode is temporary</CardTitle>
            <CardDescription>
              Guests can play, like, dislike, report, and suggest questions.
              Create an account to publish games, keep a profile, and earn
              fictional creator Tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={cn(buttonVariants(), "w-full")}
              href="/auth"
            >
              Create an account
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              Your username and bio are visible on games you publish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm profile={viewer.profile} />
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
