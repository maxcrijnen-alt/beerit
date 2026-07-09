"use client";

import { Bomb, Eye, EyeOff, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics are a nice-to-have; ignore unsupported devices.
    }
  }
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
  // Hidden countdown is the default; hosts can reveal it for beginner groups.
  const [showCountdown, setShowCountdown] = useState(false);
  const explodedRef = useRef(false);
  const active = isHost && running && remaining > 0;

  const resetTimer = useCallback(() => {
    const nextDuration = getRandomDuration(minSeconds, maxSeconds);

    setDuration(nextDuration);
    setRemaining(nextDuration);
    setRunning(isHost);
    setExploded(false);
    explodedRef.current = false;
    onExplodedChange(false);
  }, [isHost, maxSeconds, minSeconds, onExplodedChange]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((value) => {
        const nextValue = Math.max(0, value - 1);

        if (nextValue === 0 && !explodedRef.current) {
          explodedRef.current = true;
          setRunning(false);
          setExploded(true);
          onExplodedChange(true);
          vibrate([120, 60, 120, 60, 320]);
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
            <Bomb className="size-4 text-primary" />
            Bomb Mode
          </p>
          <p className="mt-2 text-sm font-medium">
            The timer already started on the host phone.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Keep passing the phone or object until BOOM.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (exploded) {
    return (
      <Card className="overflow-hidden border-primary bg-primary/15">
        <CardContent className="relative p-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-in fade-in zoom-in-50 duration-500 motion-reduce:animate-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,--theme(--color-primary/25),transparent_70%)]" />
          </div>
          <div className="relative animate-in zoom-in-75 duration-300 motion-reduce:animate-none">
            <Bomb className="mx-auto size-10 text-primary" />
            <p className="mt-2 text-5xl font-black tracking-tight">BOOM</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the player holding it below. They take the Beerits and the
              next card starts right away.
            </p>
            <Button
              className="mt-4"
              onClick={resetTimer}
              size="sm"
              type="button"
              variant="outline"
            >
              <RotateCcw className="size-4" />
              Re-arm without scoring
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="size-4 text-primary" />
              Bomb Mode — timer started automatically
            </p>
            <p className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight">
              <Bomb
                className={`size-7 text-primary ${
                  active ? "animate-pulse motion-reduce:animate-none" : ""
                }`}
              />
              {showCountdown
                ? `${remaining}s`
                : active
                  ? "Tick… tick…"
                  : "Paused"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              aria-label={
                showCountdown ? "Hide the countdown" : "Show the countdown"
              }
              onClick={() => setShowCountdown((value) => !value)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showCountdown ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
            <Button
              aria-label={active ? "Pause bomb timer" : "Resume bomb timer"}
              onClick={() => setRunning((value) => !value)}
              size="icon"
              type="button"
              variant="secondary"
            >
              {active ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button
              aria-label="Re-roll bomb timer"
              onClick={resetTimer}
              size="icon"
              type="button"
              variant="outline"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {showCountdown
            ? "Visible countdown is on — handy for beginner groups. Tap the eye to make it a surprise again."
            : "Pass it around. The duration is random for this card, so nobody — not even the host — knows when it blows."}
        </p>
      </CardContent>
    </Card>
  );
}
