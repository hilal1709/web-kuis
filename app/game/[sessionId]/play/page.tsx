import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../../actions";
import { LiveGameClient } from "../LiveGameClient";
import { HostLiveClient } from "../HostLiveClient";

export default async function LiveGamePage({
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

  // Sesi harus sedang berjalan
  if (session.status !== "active") {
    redirect(`/game/${sessionId}`);
  }

  // Cari pemain saat ini
  const currentPlayer = players.find((p) => p.user_id === user.id);

  // Owner yang tidak ikut bermain → tampilkan layar host (spectator + ranking realtime)
  if (!currentPlayer) {
    if (session.owner_id === user.id) {
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
      currentUserId={user.id}
    />
  );
}
