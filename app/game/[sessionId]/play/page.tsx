import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../../actions";
import { LiveGameClient } from "../LiveGameClient";

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

  // Get questions for the quiz
  const { data: questions } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", session.quiz_id)
    .order("position");

  if (!questions || questions.length === 0) {
    redirect("/library");
  }

  // Find current player
  const currentPlayer = players.find((p) => p.user_id === user.id);

  if (!currentPlayer) {
    redirect(`/game/${sessionId}/join`);
  }

  // Check if session is active
  if (session.status !== "active") {
    redirect(`/game/${sessionId}`);
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
