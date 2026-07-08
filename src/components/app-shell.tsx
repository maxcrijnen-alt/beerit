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
    <div className="min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))] text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 pt-[env(safe-area-inset-top)] shadow-[0_10px_30px_rgba(0,0,0,0.30)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <Link
            className="flex items-center gap-2 text-[15px] font-bold tracking-tight"
            href="/home"
          >
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(194,102,31,0.28)] ring-1 ring-white/30">
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
      <main className="app-page mx-auto w-full max-w-xl px-4 py-6">
        {children}
      </main>
      <BottomNav profileHref={profileHref} />
    </div>
  );
}
