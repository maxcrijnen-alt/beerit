import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LobbyRoom } from "@/components/lobbies/lobby-room";
import { requireViewer } from "@/lib/auth/require-viewer";
import { fetchLobbyRoom } from "@/lib/lobbies/queries";

export const dynamic = "force-dynamic";

interface LobbyRoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function LobbyRoomPage({ params }: LobbyRoomPageProps) {
  const { id } = await params;
  const [viewer, room] = await Promise.all([
    requireViewer(),
    fetchLobbyRoom(id),
  ]);

  if (!room) {
    notFound();
  }

  return (
    <AppShell viewer={viewer}>
      <LobbyRoom initialRoom={room} viewer={viewer} />
    </AppShell>
  );
}
