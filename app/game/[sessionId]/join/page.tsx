import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinGameClient } from "../JoinGameClient";

export default async function JoinGamePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("game_sessions")
    .select("*, quizzes(*, categories(*))")
    .eq("id", sessionId)
    .single();

  if (!session) {
    redirect("/library");
  }

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

  return (
    <JoinGameClient
      sessionId={sessionId}
      session={session}
      userId={user ? user.id : null}
    />
  );
}
