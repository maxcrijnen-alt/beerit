"use client";

import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TimedEventTimerProps {
  label?: string;
  seconds: number;
}

export function TimedEventTimer({ label = "Timer", seconds }: TimedEventTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const active = running && remaining > 0;

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active]);

  return (
    <Card className={remaining === 0 ? "border-primary" : undefined}>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="size-4 text-primary" />
            {remaining === 0 ? "Time is up" : label}
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold">{remaining}s</p>
        </div>
        <div className="flex gap-2">
          <Button
            aria-label={active ? "Pause timer" : "Start timer"}
            onClick={() => {
              if (remaining === 0) {
                setRemaining(seconds);
                setRunning(true);
              } else {
                setRunning((value) => !value);
              }
            }}
            size="icon"
            variant="secondary"
          >
            {active ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            aria-label="Reset timer"
            onClick={() => {
              setRemaining(seconds);
              setRunning(false);
            }}
            size="icon"
            variant="outline"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
