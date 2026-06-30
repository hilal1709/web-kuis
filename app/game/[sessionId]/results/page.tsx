import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../../actions";
import { GameResultsClient } from "../GameResultsClient";

export default async function GameResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const gameData = await getGameSession(sessionId);

  if (!gameData) {
    redirect("/library");
  }

  const { session, players } = gameData;

  // Jika sesi belum selesai, redirect ke halaman sesuai status
  if (session.status === "waiting") {
    redirect(`/game/${sessionId}`);
  }
  if (session.status === "active") {
    redirect(`/game/${sessionId}/play`);
  }

  return (
    <GameResultsClient
      sessionId={sessionId}
      session={session}
      players={players}
      currentUserId={user.id}
    />
  );
}
