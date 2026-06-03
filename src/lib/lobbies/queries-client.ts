import { createClient } from "@/lib/supabase/client";
import type { Lobby, LobbyMessage, LobbyPlayer } from "@/types/database";

export async function fetchLobby(id: string): Promise<Lobby> {
  const supabase = createClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("lobbies")
    .select("*")
    .eq("id", id)
    .single<Lobby>();

  if (error) {
    throw new Error(`Could not refresh lobby: ${error.message}`);
  }

  return data;
}

export async function fetchLobbyPlayers(id: string): Promise<LobbyPlayer[]> {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lobby_players")
    .select("*")
    .eq("lobby_id", id)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(`Could not refresh players: ${error.message}`);
  }

  return data as LobbyPlayer[];
}

export async function fetchLobbyMessages(id: string): Promise<LobbyMessage[]> {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lobby_messages")
    .select("*")
    .eq("lobby_id", id)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(`Could not refresh chat: ${error.message}`);
  }

  return data as LobbyMessage[];
}
