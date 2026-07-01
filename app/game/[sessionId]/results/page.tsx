import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../../actions";
import { GameResultsClient } from "../GameResultsClient";

export default async function GameResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{ gamePlayerId?: string }>;
}) {
  const { sessionId } = await params;
  const { gamePlayerId } = (await searchParams) || {};
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Catatan: guest (tanpa akun) juga harus bisa melihat hasil akhir,
  // jadi jangan paksa login di sini.

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
      currentUserId={user ? user.id : null}
      currentPlayerId={gamePlayerId}
    />
  );
}
