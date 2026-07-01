import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../../actions";
import { LiveGameClient } from "../LiveGameClient";
import { HostLiveClient } from "../HostLiveClient";

export default async function LiveGamePage({
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

  const gameData = await getGameSession(sessionId);

  if (!gameData) {
    redirect("/library");
  }

  const { session, players } = gameData;

  // Sesi harus sedang berjalan
  if (session.status !== "active") {
    if (gamePlayerId) {
      redirect(`/game/${sessionId}?gamePlayerId=${gamePlayerId}`);
    } else {
      redirect(`/game/${sessionId}`);
    }
  }

  // Cari pemain saat ini:
  let currentPlayer: any;
  if (user) {
    currentPlayer = players.find((p) => p.user_id === user.id);
  } else if (gamePlayerId) {
    currentPlayer = players.find((p) => p.id === gamePlayerId);
  }

  // Owner yang tidak ikut bermain → tampilkan layar host (spectator + ranking realtime)
  if (!currentPlayer) {
    if (user && session.owner_id === user.id) {
      return (
        <HostLiveClient
          sessionId={sessionId}
          session={session}
          players={players}
        />
      );
    }
    redirect(`/game/${sessionId}/join`);
  }

  // Get questions for the quiz
  const { data: questions } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", session.quiz_id)
    .order("position");

  if (!questions || questions.length === 0) {
    redirect("/library");
  }

  return (
    <LiveGameClient
      sessionId={sessionId}
      session={session}
      players={players}
      questions={questions}
      currentPlayer={currentPlayer}
      currentUserId={user ? user.id : null}
    />
  );
}
