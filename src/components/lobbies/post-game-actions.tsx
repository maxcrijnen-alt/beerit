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
      <div className="grid grid-cols-2 gap-2">
        <Link
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
          href={`/lobby/create/${gameId}`}
        >
          <RotateCcw className="size-4" />
          Rematch
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: "lg", variant: "secondary" }),
            "w-full",
          )}
          href="/browse"
        >
          <Search className="size-4" />
          Other game
        </Link>
        <Link
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "col-span-2 w-full",
          )}
          href="/home"
        >
          <DoorOpen className="size-4" />
          End the night
        </Link>
      </div>

      {showQuestionForm ? (
        <div className="animate-in space-y-2 fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Optional: suggest a question</p>
            <Button
              onClick={() => setShowQuestionForm(false)}
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
              Skip for now
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
          Suggest a question
        </Button>
      )}
    </section>
  );
}
