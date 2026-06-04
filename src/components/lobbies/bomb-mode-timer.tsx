"use client";

import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BombModeTimerProps {
  isHost: boolean;
  maxSeconds: number;
  minSeconds: number;
  onExplodedChange: (exploded: boolean) => void;
}

function getRandomDuration(minSeconds: number, maxSeconds: number) {
  const safeMin = Math.max(5, Math.min(300, Math.floor(minSeconds)));
  const safeMax = Math.max(safeMin, Math.min(300, Math.floor(maxSeconds)));

  return safeMin + Math.floor(Math.random() * (safeMax - safeMin + 1));
}

export function BombModeTimer({
  isHost,
  maxSeconds,
  minSeconds,
  onExplodedChange,
}: BombModeTimerProps) {
  const [duration, setDuration] = useState(() =>
    getRandomDuration(minSeconds, maxSeconds),
  );
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(isHost);
  const [exploded, setExploded] = useState(false);
  const active = isHost && running && remaining > 0;
  const progress = duration > 0 ? (remaining / duration) * 100 : 0;

  const resetTimer = useCallback(() => {
    const nextDuration = getRandomDuration(minSeconds, maxSeconds);

    setDuration(nextDuration);
    setRemaining(nextDuration);
    setRunning(isHost);
    setExploded(false);
    onExplodedChange(false);
  }, [isHost, maxSeconds, minSeconds, onExplodedChange]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((value) => {
        const nextValue = Math.max(0, value - 1);

        if (nextValue === 0) {
          setRunning(false);
          setExploded(true);
          onExplodedChange(true);
        }

        return nextValue;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active, onExplodedChange]);

  if (!isHost) {
    return (
      <Card className="border-primary/30 bg-accent/30">
        <CardContent className="p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-4 text-primary" />
            Bomb Mode
          </p>
          <p className="mt-2 text-sm font-medium">
            The host timer decides when it explodes.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Keep passing the phone or object until the host calls BOOM.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={exploded ? "border-primary bg-primary/10" : "border-primary/30"}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="size-4 text-primary" />
              {exploded ? "Bomb Mode exploded" : "Bomb Mode timer"}
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold">
              {exploded ? "BOOM" : `${remaining}s`}
            </p>
          </div>
          <div className="flex gap-2">
            {!exploded ? (
              <Button
                aria-label={active ? "Pause bomb timer" : "Resume bomb timer"}
                onClick={() => setRunning((value) => !value)}
                size="icon"
                variant="secondary"
              >
                {active ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
            ) : null}
            <Button
              aria-label="Re-roll bomb timer"
              onClick={resetTimer}
              size="icon"
              variant="outline"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {exploded
            ? "Tap the player holding it below to add Beerits and continue."
            : "Pass it around. The starting duration is randomly picked for this card."}
        </p>
      </CardContent>
    </Card>
  );
}
