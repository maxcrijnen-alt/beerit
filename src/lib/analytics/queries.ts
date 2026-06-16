import { logDevelopmentError } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import type { AppEventType } from "@/lib/analytics/events";

export interface AppEventSummary {
  actor_kind: "ACCOUNT" | "GUEST" | "UNKNOWN";
  event_count: number;
  event_type: AppEventType;
  latest_event_at: string | null;
}

export async function fetchAppEventSummary(days = 14): Promise<AppEventSummary[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase.rpc("get_app_event_summary", {
    p_since: since.toISOString(),
  });

  if (error) {
    logDevelopmentError("Could not fetch app event summary.", error);
    return [];
  }

  return (data ?? []) as AppEventSummary[];
}
