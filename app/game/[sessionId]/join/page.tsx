import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinGameSession } from "../../actions";
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

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("game_sessions")
    .select("*, quizzes(*, categories(*))")
    .eq("id", sessionId)
    .single();

  if (!session) {
    redirect("/library");
  }

  return (
    <JoinGameClient
      sessionId={sessionId}
      session={session}
      userId={user.id}
    />
  );
}
