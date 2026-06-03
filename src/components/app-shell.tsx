import { Beer, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/types/database";

interface AppShellProps {
  children: ReactNode;
  viewer: Viewer;
}

export function AppShell({ children, viewer }: AppShellProps) {
  const displayName =
    viewer.profile?.username ?? viewer.guestName ?? viewer.email ?? "Guest";
  const profileHref = viewer.profile
    ? `/profile/${viewer.profile.username}`
    : "/settings";

  return (
    <div className="min-h-dvh bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <Link className="flex items-center gap-2 font-semibold" href="/home">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Beer className="size-4" />
            </span>
            Beerit
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant={viewer.isAnonymous ? "secondary" : "outline"}>
              {viewer.isAnonymous ? "Guest" : displayName}
            </Badge>
            <form action="/auth/signout" method="post">
              <button
                aria-label="Sign out"
                className={cn(buttonVariants({ size: "icon", variant: "ghost" }))}
                type="submit"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="app-page mx-auto w-full max-w-xl px-4 py-5">{children}</main>
      <BottomNav profileHref={profileHref} />
    </div>
  );
}
