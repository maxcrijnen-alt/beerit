export interface Profile {
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  id: string;
  role: "ADMIN" | "USER";
  total_games_created: number;
  total_likes_received: number;
  total_tokens: number;
  updated_at: string;
  username: string;
}

export interface Viewer {
  email: string | null;
  guestName: string | null;
  id: string;
  isAnonymous: boolean;
  profile: Profile | null;
}

export const GAME_CATEGORIES = [
  "Truth or Dare",
  "Never Have I Ever",
  "Most Likely To",
  "Would You Rather",
  "Challenges",
  "Card Games",
  "Board Games",
  "Dice Games",
  "Team Games",
  "Custom Rules",
  "Icebreakers",
  "Conversation",
  "Trivia",
  "Road Trip",
  "Custom Concept",
] as const;

export const GAME_INTENSITIES = ["Soft", "Funny", "Spicy", "Chaos"] as const;

export const GAME_VISIBILITIES = ["PUBLIC", "PRIVATE", "UNLISTED"] as const;

export const GAME_CARD_TYPES = [
  "QUESTION",
  "DARE",
  "VOTE",
  "CHALLENGE",
  "RULE",
  "MANUAL_SCORING_ACTION",
  "ACTIVITY",
  "TIMED_EVENT",
] as const;

export const GAME_ACTIVITY_KINDS = [
  "BOARD_GAME",
  "CARD_GAME",
  "DICE_GAME",
  "OTHER",
] as const;

export const TIMER_BEHAVIORS = ["FIXED", "RANDOM_BOMB"] as const;

export const LOBBY_ACTIVITY_SELECTION_MODES = ["MIXED", "ONLY_SELECTED"] as const;

export const GAME_VOTE_TYPES = ["LIKE", "DISLIKE"] as const;

export const GAME_REPORT_REASONS = [
  "SELF_HARM",
  "UNDERAGE_DRINKING",
  "REAL_GAMBLING",
  "HATE_HARASSMENT",
  "DANGEROUS_CHALLENGE",
  "SPAM",
  "OTHER",
] as const;

export const DISCOVERY_CONTENT_MODES = ["BOTH", "DIGITAL", "PHYSICAL"] as const;

export const DISCOVERY_POOLS = [
  "HOT",
  "TOP",
  "RECENT",
  "MOST_LIKED",
  "SURPRISE",
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];
export type GameIntensity = (typeof GAME_INTENSITIES)[number];
export type GameVisibility = (typeof GAME_VISIBILITIES)[number];
export type GameCardType = (typeof GAME_CARD_TYPES)[number];
export type GameActivityKind = (typeof GAME_ACTIVITY_KINDS)[number];
export type TimerBehavior = (typeof TIMER_BEHAVIORS)[number];
export type LobbyActivitySelectionMode =
  (typeof LOBBY_ACTIVITY_SELECTION_MODES)[number];
export type GameVoteType = (typeof GAME_VOTE_TYPES)[number];
export type GameReportReason = (typeof GAME_REPORT_REASONS)[number];
export type DiscoveryContentMode = (typeof DISCOVERY_CONTENT_MODES)[number];
export type DiscoveryPool = (typeof DISCOVERY_POOLS)[number];

export interface Game {
  category: GameCategory;
  concept: string | null;
  created_at: string;
  creator_id: string | null;
  description: string | null;
  dislikes_count: number;
  estimated_duration: number | null;
  id: string;
  intensity: GameIntensity;
  is_hidden: boolean;
  likes_count: number;
  max_players: number | null;
  min_players: number;
  plays_count: number;
  remixed_from_game_id: string | null;
  reports_count: number;
  rules: string | null;
  rules_url: string | null;
  saves_count: number;
  title: string;
  updated_at: string;
  visibility: GameVisibility;
}

export interface GameCard {
  activity_kind: GameActivityKind | null;
  beerits_value: number;
  card_type: GameCardType;
  created_at: string;
  game_id: string;
  id: string;
  dislikes_count: number;
  intensity: GameIntensity;
  is_community: boolean;
  is_hidden: boolean;
  likes_count: number;
  position: number;
  submitted_by_session_user_id: string | null;
  text: string;
  timer_behavior: TimerBehavior;
  timer_max_seconds: number | null;
  timer_min_seconds: number | null;
  timer_seconds: number | null;
}

export interface GameSummary extends Game {
  cards_count: number;
  creator_username: string | null;
}

export interface GameDetail extends GameSummary {
  cards: GameCard[];
  community_cards: GameCard[];
  remixed_from_title: string | null;
}

export interface GameReport {
  created_at: string;
  details: string | null;
  game_id: string;
  id: string;
  reason: GameReportReason;
}

export interface GameSocialState {
  hasReported: boolean;
  isSaved: boolean;
  vote: GameVoteType | null;
}

export interface ModerationGame {
  created_at: string;
  creator_username: string | null;
  dislikes_count: number;
  id: string;
  is_hidden: boolean;
  likes_count: number;
  reports: GameReport[];
  reports_count: number;
  title: string;
}

export const LOBBY_STATUSES = ["WAITING", "ACTIVE", "FINISHED"] as const;

export const LOBBY_CONTROLS = [
  "START",
  "PREVIOUS",
  "NEXT",
  "SKIP",
  "END",
] as const;

export type LobbyStatus = (typeof LOBBY_STATUSES)[number];
export type LobbyControl = (typeof LOBBY_CONTROLS)[number];

export interface Lobby {
  activity_kinds: GameActivityKind[];
  activity_selection_mode: LobbyActivitySelectionMode;
  code: string;
  created_at: string;
  current_card_index: number;
  ended_at: string | null;
  game_id: string;
  host_guest_name: string | null;
  host_session_user_id: string;
  host_user_id: string | null;
  id: string;
  include_community_cards: boolean;
  mixed_categories: GameCategory[];
  started_at: string | null;
  status: LobbyStatus;
  updated_at: string;
}

export interface LobbyPlayer {
  beerits: number;
  display_name: string;
  guest_name: string | null;
  id: string;
  is_host: boolean;
  joined_at: string;
  lobby_id: string;
  session_user_id: string;
  updated_at: string;
  user_id: string | null;
}

export interface LobbyMessage {
  created_at: string;
  display_name: string;
  guest_name: string | null;
  id: string;
  lobby_id: string;
  message: string;
  sender_session_user_id: string;
  user_id: string | null;
}

export interface LobbySummary extends Lobby {
  game_title: string;
  players_count: number;
}

export interface LobbyRoomData {
  card_votes: Record<string, GameVoteType | null>;
  cards: GameCard[];
  game: Pick<Game, "id" | "rules" | "title">;
  lobby: Lobby;
  messages: LobbyMessage[];
  players: LobbyPlayer[];
}

export interface FriendStanding {
  direction: "INCOMING" | "OUTGOING";
  friend_beerits: number;
  friend_id: string;
  friend_username: string;
  friendship_id: string;
  shared_lobbies: number;
  status: "ACCEPTED" | "PENDING";
  your_beerits: number;
}
