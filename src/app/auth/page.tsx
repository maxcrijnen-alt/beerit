import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { ResponsiblePlayNote } from "@/components/responsible-play-note";
import { getViewer } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

interface AuthPageProps {
  searchParams: Promise<{ notice?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const viewer = await getViewer();
  const { notice } = await searchParams;

  if (viewer && !viewer.isAnonymous) {
    redirect("/home");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between py-2">
          <Link className="font-semibold" href="/">
            Beerit
          </Link>
          <span className="text-xs text-muted-foreground">
            Fictional party points
          </span>
        </div>
        {notice ? (
          <p className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
            {notice}
          </p>
        ) : null}
        {viewer?.isAnonymous ? (
          <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            You are currently playing as {viewer.guestName}. Create an account
            to publish games and earn fictional creator Tokens.
          </p>
        ) : null}
        <AuthPanel />
        <ResponsiblePlayNote compact />
      </div>
    </main>
  );
}
