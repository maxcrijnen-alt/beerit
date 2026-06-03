"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { logDevelopmentError } from "@/lib/dev-log";
import { cn } from "@/lib/utils";

const SLOW_LOADING_TIMEOUT_MS = 6000;

export default function Loading() {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsTakingLonger(true);
      logDevelopmentError(
        "Page loading exceeded the expected time.",
        new Error("Slow page load"),
      );
    }, SLOW_LOADING_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <LoaderCircle className="size-6 animate-spin text-primary" />
        <p className="text-sm font-medium">
          {isTakingLonger ? "Beerit is taking a little longer to load." : "Loading Beerit..."}
        </p>
        {isTakingLonger ? (
          <>
            <p className="text-sm leading-5 text-muted-foreground">
              Your connection may be slow. Try again, or continue from the
              guest-friendly start screen.
            </p>
            <div className="grid w-full gap-2 pt-1">
              <Button onClick={() => window.location.reload()} type="button">
                Try again
              </Button>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                href="/"
              >
                Back to start
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
