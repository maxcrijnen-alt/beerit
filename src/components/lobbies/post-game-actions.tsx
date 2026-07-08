"use client";

import { DoorOpen, Plus, RotateCcw, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommunityQuestionForm } from "@/components/games/community-question-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostGameActionsProps {
  gameId: string;
}

export function PostGameActions({ gameId }: PostGameActionsProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-border bg-muted/35 p-3">
        <p className="text-sm font-semibold">Wat nu?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Voeg iets toe als je inspiratie hebt, of skip direct naar opnieuw spelen, een ander spel of home.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
          href={`/lobby/create/${gameId}`}
        >
          <RotateCcw className="size-4" />
          Play again
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: "lg", variant: "secondary" }),
            "w-full",
          )}
          href="/browse"
        >
          <Search className="size-4" />
          Choose game
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "col-span-2 w-full",
          )}
          href="/home"
        >
          <DoorOpen className="size-4" />
          Stop de avond
        </Link>
      </div>

      {showQuestionForm ? (
        <div className="animate-in space-y-2 fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Optional: add something for next time</p>
            <Button
              onClick={() => setShowQuestionForm(false)}
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
              Skip
            </Button>
          </div>
          <CommunityQuestionForm canSubmit gameId={gameId} />
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={() => setShowQuestionForm(true)}
          size="lg"
          variant="outline"
        >
          <Plus className="size-4" />
          Add a question
        </Button>
      )}
    </section>
  );
}
