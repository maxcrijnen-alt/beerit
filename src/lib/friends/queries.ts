import { createClient } from "@/lib/supabase/server";
import type { FriendStanding } from "@/types/database";

export async function fetchFriendStandings(): Promise<FriendStanding[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_friend_standings");

  if (error) {
    throw new Error(`Could not fetch friends: ${error.message}`);
  }

  return data as FriendStanding[];
}
