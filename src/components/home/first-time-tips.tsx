"use client";

import { Coins, Gamepad2, Shuffle, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { logDevelopmentError } from "@/lib/dev-log";

const STORAGE_KEY = "beerit:home-tips-dismissed";

const tips = [
  {
    description:
      "Every game runs in a lobby. Start one, share the code, and play on one phone or across devices.",
    icon: Gamepad2,
    title: "Play through a lobby",
  },
  {
    description:
      "Beerits are fictional penalty points, just for fun. No real money, no debts, no settling up.",
    icon: Coins,
    title: "Beerits are fictional",
  },
  {
    description:
      "Not sure what to play? Tap “Pick random game” to jump straight into a lobby.",
    icon: Shuffle,
    title: "Start fast",
  },
] as const;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

function isDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch (error) {
    logDevelopmentError("Could not read home tips preference.", error);

    // Fail safe: hide rather than risk showing tips on every visit.
    return true;
  }
}

// Hidden during SSR so the server markup matches the dismissed-by-default
// state; the client re-reads localStorage after hydration.
function isDismissedOnServer() {
  return true;
}

export function FirstTimeTips() {
  const dismissed = useSyncExternalStore(
    subscribe,
    isDismissed,
    isDismissedOnServer,
  );

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch (error) {
      logDevelopmentError("Could not save home tips preference.", error);
    }

    // Notify this tab; the storage event only fires in other tabs natively.
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }

  if (dismissed) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-border/80 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">New to Beerit?</h2>
        <Button
          aria-label="Dismiss tips"
          onClick={dismiss}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>
      <ul className="mt-2 space-y-3">
        {tips.map(({ description, icon: Icon, title }) => (
          <li className="flex items-start gap-3" key={title}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Button
        className="mt-3 w-full"
        onClick={dismiss}
        size="sm"
        variant="secondary"
      >
        Got it
      </Button>
    </section>
  );
}
