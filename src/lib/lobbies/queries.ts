import { createClient as createServerClient } from "@/lib/supabase/server";
import type {
  Game,
  GameCard,
  Lobby,
  LobbyMessage,
  LobbyPlayer,
  LobbyRoomData,
  LobbySessionQuestion,
  LobbySummary,
} from "@/types/database";

interface LobbySummaryRow extends Lobby {
  game: Pick<Game, "title"> | null;
  lobby_players: { count: number }[];
}

interface LobbyCardRow {
  card: GameCard | null;
  position: number;
}

const LOBBY_SUMMARY_SELECT = `
  *,
  game:games!lobbies_game_id_fkey(title),
  lobby_players(count)
`;

export async function fetchViewerLobbies(): Promise<LobbySummary[]> {
  const supabase = await createServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lobbies")
    .select(LOBBY_SUMMARY_SELECT)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Could not fetch lobbies: ${error.message}`);
  }

  return (data as unknown as LobbySummaryRow[]).map((lobby) => ({
    ...lobby,
    game_title: lobby.game?.title ?? "Beerit game",
    players_count: lobby.lobby_players[0]?.count ?? 0,
  }));
}

export async function fetchLobbyRoom(id: string): Promise<LobbyRoomData | null> {
  const supabase = await createServerClient();

  if (!supabase) {
    return null;
  }

  const { data: lobby, error: lobbyError } = await supabase
    .from("lobbies")
    .select("*")
    .eq("id", id)
    .maybeSingle<Lobby>();

  if (lobbyError) {
    throw new Error(`Could not fetch lobby: ${lobbyError.message}`);
  }

  if (!lobby) {
    return null;
  }

  const [
    gameResult,
    cardsResult,
    playersResult,
    messagesResult,
    sessionQuestionsResult,
  ] = await Promise.all([
      supabase
        .from("games")
        .select("id, rules, title")
        .eq("id", lobby.game_id)
        .single<Pick<Game, "id" | "rules" | "title">>(),
      supabase
        .from("lobby_cards")
        .select("position, card:game_cards!lobby_cards_game_card_id_fkey(*)")
        .eq("lobby_id", lobby.id)
        .order("position", { ascending: true }),
      supabase
        .from("lobby_players")
        .select("*")
        .eq("lobby_id", lobby.id)
        .order("joined_at", { ascending: true }),
      supabase
        .from("lobby_messages")
        .select("*")
        .eq("lobby_id", lobby.id)
        .order("created_at", { ascending: true })
        .limit(50),
      supabase
        .from("lobby_session_questions")
        .select("*")
        .eq("lobby_id", lobby.id)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }),
    ]);

  if (gameResult.error) {
    throw new Error(`Could not fetch lobby game: ${gameResult.error.message}`);
  }

  if (cardsResult.error) {
    throw new Error(`Could not fetch lobby cards: ${cardsResult.error.message}`);
  }

  if (playersResult.error) {
    throw new Error(`Could not fetch lobby players: ${playersResult.error.message}`);
  }

  if (messagesResult.error) {
    throw new Error(`Could not fetch lobby chat: ${messagesResult.error.message}`);
  }

  if (sessionQuestionsResult.error) {
    throw new Error(
      `Could not fetch session questions: ${sessionQuestionsResult.error.message}`,
    );
  }

  const cards = (cardsResult.data as unknown as LobbyCardRow[]).flatMap(
    (row) => (row.card ? [{ ...row.card, position: row.position }] : []),
  );
  const cardIds = cards.map((card) => card.id);
  const cardVotesResult =
    cardIds.length > 0
      ? await supabase
          .from("game_card_votes")
          .select("game_card_id, vote_type")
          .in("game_card_id", cardIds)
      : { data: [], error: null };

  if (cardVotesResult.error) {
    throw new Error(`Could not fetch lobby card votes: ${cardVotesResult.error.message}`);
  }

  return {
    card_votes: Object.fromEntries(
      cardVotesResult.data.map((vote) => [vote.game_card_id, vote.vote_type]),
    ),
    cards,
    game: gameResult.data,
    lobby,
    messages: messagesResult.data as LobbyMessage[],
    players: playersResult.data as LobbyPlayer[],
    session_questions: sessionQuestionsResult.data as LobbySessionQuestion[],
  };
}
