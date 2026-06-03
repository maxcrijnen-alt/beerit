import { createClient } from "@/lib/supabase/server";
import type {
  GameReport,
  GameReportReason,
  GameSocialState,
  GameVoteType,
  ModerationGame,
  Viewer,
} from "@/types/database";

interface ModerationGameRow {
  created_at: string;
  creator: { username: string } | null;
  dislikes_count: number;
  game_reports: Array<{
    created_at: string;
    details: string | null;
    game_id: string;
    id: string;
    reason: GameReportReason;
  }>;
  id: string;
  is_hidden: boolean;
  likes_count: number;
  reports_count: number;
  title: string;
}

const EMPTY_SOCIAL_STATE: GameSocialState = {
  hasReported: false,
  isSaved: false,
  vote: null,
};

export async function fetchGameSocialState(
  gameId: string,
  viewer: Viewer | null,
): Promise<GameSocialState> {
  if (!viewer) {
    return EMPTY_SOCIAL_STATE;
  }

  const supabase = await createClient();

  if (!supabase) {
    return EMPTY_SOCIAL_STATE;
  }

  const voteResult = await supabase
    .from("game_votes")
    .select("vote_type")
    .eq("game_id", gameId)
    .eq("actor_session_user_id", viewer.id)
    .maybeSingle<{ vote_type: GameVoteType }>();

  if (voteResult.error) {
    throw new Error(`Could not fetch vote: ${voteResult.error.message}`);
  }

  const reportResult = await supabase
    .from("game_reports")
    .select("id")
    .eq("game_id", gameId)
    .eq("actor_session_user_id", viewer.id)
    .maybeSingle<{ id: string }>();

  if (reportResult.error) {
    throw new Error(`Could not fetch report: ${reportResult.error.message}`);
  }

  if (viewer.isAnonymous) {
    return {
      hasReported: Boolean(reportResult.data),
      isSaved: false,
      vote: voteResult.data?.vote_type ?? null,
    };
  }

  const savedResult = await supabase
    .from("saved_games")
    .select("game_id")
    .eq("game_id", gameId)
    .eq("user_id", viewer.id)
    .maybeSingle<{ game_id: string }>();

  if (savedResult.error) {
    throw new Error(`Could not fetch saved game: ${savedResult.error.message}`);
  }

  return {
    hasReported: Boolean(reportResult.data),
    isSaved: Boolean(savedResult.data),
    vote: voteResult.data?.vote_type ?? null,
  };
}

export async function fetchGameCardVoteStates(
  gameCardIds: string[],
  viewer: Viewer | null,
): Promise<Record<string, GameVoteType | null>> {
  if (!viewer || gameCardIds.length === 0) {
    return {};
  }

  const supabase = await createClient();

  if (!supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("game_card_votes")
    .select("game_card_id, vote_type")
    .in("game_card_id", gameCardIds)
    .eq("actor_session_user_id", viewer.id);

  if (error) {
    throw new Error(`Could not fetch card votes: ${error.message}`);
  }

  return Object.fromEntries(
    data.map((vote) => [vote.game_card_id, vote.vote_type as GameVoteType]),
  );
}

export async function fetchModerationQueue(): Promise<ModerationGame[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("games")
    .select(`
      id,
      title,
      created_at,
      is_hidden,
      likes_count,
      dislikes_count,
      reports_count,
      creator:profiles!games_creator_id_fkey(username),
      game_reports(id, game_id, reason, details, created_at)
    `)
    .or("is_hidden.eq.true,reports_count.gt.0,dislikes_count.gt.0")
    .order("reports_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not fetch moderation queue: ${error.message}`);
  }

  return (data as unknown as ModerationGameRow[]).map((row) => ({
    created_at: row.created_at,
    creator_username: row.creator?.username ?? null,
    dislikes_count: row.dislikes_count,
    id: row.id,
    is_hidden: row.is_hidden,
    likes_count: row.likes_count,
    reports: row.game_reports as GameReport[],
    reports_count: row.reports_count,
    title: row.title,
  }));
}
