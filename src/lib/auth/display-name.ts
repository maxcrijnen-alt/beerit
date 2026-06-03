import type { Viewer } from "@/types/database";

export function getViewerDisplayName(viewer: Viewer) {
  return viewer.profile?.username ?? viewer.guestName ?? "Guest";
}
