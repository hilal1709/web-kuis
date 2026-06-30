import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameSession } from "../actions";
import { WaitingRoomClient } from "./WaitingRoomClient";

export default async function GameSessionPage({
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

  // Cek apakah kuisnya public atau user adalah pemiliknya
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("is_public, created_by")
    .eq("id", session.quiz_id)
    .single();

  if (!quiz) {
    redirect("/library");
  }

  if (!quiz.is_public && user.id !== session.owner_id && user.id !== quiz.created_by) {
    redirect("/?error=" + encodeURIComponent("Kuis ini tidak publik."));
  }

  // Jika sesi sudah selesai, redirect ke halaman results
  if (session.status === "completed") {
    redirect(`/game/${sessionId}/results`);
  }

  // Jika sesi sedang berjalan, redirect ke halaman play
  if (session.status === "active") {
    redirect(`/game/${sessionId}/play`);
  }

  // Cek apakah user adalah owner
  const isOwner = session.owner_id === user.id;

  // Cek apakah user sudah join
  const player = players.find((p) => p.user_id === user.id);

  if (!player && !isOwner) {
    // Redirect ke halaman join jika belum bergabung
    redirect(`/game/${sessionId}/join`);
  }

  return (
    <WaitingRoomClient
      sessionId={sessionId}
      session={session}
      players={players}
      isOwner={isOwner}
      currentUserId={user.id}
      currentPlayerId={player?.id}
    />
  );
}
