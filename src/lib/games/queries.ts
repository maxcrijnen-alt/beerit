import { withTimeout } from "@/lib/async/with-timeout";
import { createClient } from "@/lib/supabase/server";
import type {
  Game,
  GameCard,
  GameDetail,
  GameSummary,
  GameTopic,
} from "@/types/database";

interface CreatorRelation {
  username: string;
}

interface GameCardCountRelation {
  count: number;
}

interface GameSummaryRow extends Game {
  creator: CreatorRelation | null;
  game_cards: GameCardCountRelation[];
}

interface GameDetailRow extends Game {
  creator: CreatorRelation | null;
  game_cards: GameCard[];
}

interface GameCardTopicRow {
  game_card_id: string;
  topic_id: string;
}

const SUMMARY_SELECT = `
  *,
  creator:profiles!games_creator_id_fkey(username),
  game_cards(count)
`;

const DETAIL_SELECT = `
  *,
  creator:profiles!games_creator_id_fkey(username),
  game_cards(*)
`;

const GAME_QUERY_TIMEOUT_MS = 6000;

function mapGameSummary(row: GameSummaryRow): GameSummary {
  return {
    ...row,
    cards_count: row.game_cards[0]?.count ?? 0,
    creator_username: row.creator?.username ?? null,
  };
}

export async function fetchGames(): Promise<GameSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await withTimeout(
    supabase
      .from("games")
      .select(SUMMARY_SELECT)
      .eq("visibility", "PUBLIC")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false }),
    GAME_QUERY_TIMEOUT_MS,
    "Game list lookup timed out.",
  );

  if (error) {
    throw new Error(`Could not fetch games: ${error.message}`);
  }

  return (data as unknown as GameSummaryRow[]).map(mapGameSummary);
}

export async function fetchGameById(id: string): Promise<GameDetail | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await withTimeout(
    supabase.from("games").select(DETAIL_SELECT).eq("id", id).maybeSingle(),
    GAME_QUERY_TIMEOUT_MS,
    "Game lookup timed out.",
  );

  if (error) {
    throw new Error(`Could not fetch game: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as GameDetailRow;
  let remixedFromTitle: string | null = null;
  const visibleCards = [...row.game_cards]
    .filter((card) => !card.is_hidden)
    .sort((a, b) => a.position - b.position);
  const cardIds = visibleCards.map((card) => card.id);
  const [topicsResult, cardTopicsResult] = await Promise.all([
    supabase
      .from("game_topics")
      .select("*")
      .eq("game_id", row.id)
      .eq("is_hidden", false)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
    cardIds.length > 0
      ? supabase
          .from("game_card_topics")
          .select("game_card_id, topic_id")
          .in("game_card_id", cardIds)
      : { data: [], error: null },
  ]);

  if (topicsResult.error) {
    throw new Error(`Could not fetch game topics: ${topicsResult.error.message}`);
  }

  if (cardTopicsResult.error) {
    throw new Error(
      `Could not fetch game card topics: ${cardTopicsResult.error.message}`,
    );
  }

  const topics = topicsResult.data as GameTopic[];
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const topicIdsByCard = new Map<string, string[]>();

  for (const relation of cardTopicsResult.data as GameCardTopicRow[]) {
    const topicIds = topicIdsByCard.get(relation.game_card_id) ?? [];

    topicIds.push(relation.topic_id);
    topicIdsByCard.set(relation.game_card_id, topicIds);
  }

  const visibleCardsWithTopics = visibleCards.map((card) => ({
    ...card,
    topics: (topicIdsByCard.get(card.id) ?? [])
      .map((topicId) => topicsById.get(topicId))
      .filter((topic): topic is GameTopic => Boolean(topic)),
  }));

  if (row.remixed_from_game_id) {
    const { data: original } = await supabase
      .from("games")
      .select("title")
      .eq("id", row.remixed_from_game_id)
      .maybeSingle<{ title: string }>();

    remixedFromTitle = original?.title ?? null;
  }

  return {
    ...row,
    cards: visibleCardsWithTopics.filter((card) => !card.is_community),
    cards_count: visibleCards.length,
    community_cards: visibleCardsWithTopics.filter((card) => card.is_community),
    creator_username: row.creator?.username ?? null,
    remixed_from_title: remixedFromTitle,
    topics,
  };
}

export async function fetchGamesByCreator(
  creatorId: string,
): Promise<GameSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await withTimeout(
    supabase
      .from("games")
      .select(SUMMARY_SELECT)
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false }),
    GAME_QUERY_TIMEOUT_MS,
    "Creator game list lookup timed out.",
  );

  if (error) {
    throw new Error(`Could not fetch creator games: ${error.message}`);
  }

  return (data as unknown as GameSummaryRow[]).map(mapGameSummary);
}
