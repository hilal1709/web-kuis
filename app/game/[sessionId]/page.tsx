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

  const gameData = await getGameSession(sessionId);

  if (!gameData) {
    redirect("/library");
  }

  const { session, players } = gameData;

  // Cek apakah kuisnya public atau user adalah pemiliknya (jika login)
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("is_public, created_by")
    .eq("id", session.quiz_id)
    .single();

  if (!quiz) {
    redirect("/library");
  }

  if (user && !quiz.is_public && user.id !== session.owner_id && user.id !== quiz.created_by) {
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

  // Cek apakah user adalah owner (hanya jika user login)
  const isOwner = user ? session.owner_id === user.id : false;

  // Cek apakah user sudah join (hanya jika user login)
  const player = user ? players.find((p) => p.user_id === user.id) : undefined;

  // Jika user tidak login, redirect ke join
  if (!user && !player) {
    redirect(`/game/${sessionId}/join`);
  }

  // Jika user login tapi belum join dan bukan owner, redirect ke join
  if (user && !player && !isOwner) {
    redirect(`/game/${sessionId}/join`);
  }

  return (
    <WaitingRoomClient
      sessionId={sessionId}
      session={session}
      players={players}
      isOwner={isOwner}
      currentUserId={user ? user.id : null}
      currentPlayerId={player?.id}
    />
  );
}
