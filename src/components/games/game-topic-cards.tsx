"use client";

import { Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { CurrentGameCard } from "@/components/games/current-game-card";
import { GameCardVoteButtons } from "@/components/games/game-card-vote-buttons";
import { Button } from "@/components/ui/button";
import type { GameCard, GameTopic, GameVoteType } from "@/types/database";

interface GameTopicCardsProps {
  canVote: boolean;
  cards: GameCard[];
  cardVotes: Record<string, GameVoteType | null>;
  topics: GameTopic[];
}

export function GameTopicCards({
  canVote,
  cards,
  cardVotes,
  topics,
}: GameTopicCardsProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Count tagged cards per topic so chips can show coverage and disable
  // filters that would land on an empty list.
  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>();

    cards.forEach((card) => {
      card.topics?.forEach((topic) => {
        counts.set(topic.id, (counts.get(topic.id) ?? 0) + 1);
      });
    });

    return counts;
  }, [cards]);

  const visibleCards = useMemo(() => {
    if (!selectedTopicId) {
      return cards;
    }

    return cards.filter((card) =>
      card.topics?.some((topic) => topic.id === selectedTopicId),
    );
  }, [cards, selectedTopicId]);

  return (
    <div className="space-y-5">
      {topics.length ? (
        <section className="space-y-2">
          <div>
            <h2 className="font-semibold">Topics</h2>
            <p className="text-xs leading-5 text-muted-foreground">
              Tap a topic to filter the cards below. Spicy topics stay opt-in
              for adult groups, and empty topics are waiting for new questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedTopicId(null)}
              size="sm"
              variant={selectedTopicId === null ? "secondary" : "outline"}
            >
              All
              <span className="ml-1 text-xs text-muted-foreground">
                {cards.length}
              </span>
            </Button>
            {topics.map((topic) => {
              const count = topicCounts.get(topic.id) ?? 0;

              return (
                <Button
                  disabled={count === 0}
                  key={topic.id}
                  onClick={() =>
                    setSelectedTopicId((current) =>
                      current === topic.id ? null : topic.id,
                    )
                  }
                  size="sm"
                  title={
                    count === 0
                      ? "No cards use this topic yet"
                      : undefined
                  }
                  variant={selectedTopicId === topic.id ? "secondary" : "outline"}
                >
                  {topic.is_spicy ? (
                    <Flame className="size-3 text-primary" />
                  ) : null}
                  {topic.title}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </section>
      ) : null}
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Card preview</h2>
          <p className="text-xs text-muted-foreground">
            {selectedTopicId
              ? "Showing cards tagged with this topic. The lobby plays them in order."
              : "The lobby will play these in order."}
          </p>
        </div>
        {visibleCards.length ? (
          visibleCards.map((card) => (
            <div className="space-y-2" key={card.id}>
              <CurrentGameCard card={card} />
              <GameCardVoteButtons
                canVote={canVote}
                cardId={card.id}
                dislikes={card.dislikes_count}
                initialVote={cardVotes[card.id] ?? null}
                likes={card.likes_count}
              />
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
            No preview cards use this topic yet.
          </p>
        )}
      </section>
    </div>
  );
}
