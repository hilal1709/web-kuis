"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { createClient } from "@/lib/supabase/client";
import { startGameSession } from "../actions";

type Session = {
  id: string;
  status: string;
  min_players: number;
  owner_id: string;
  quizzes: {
    title: string;
    categories: {
      name: string;
    };
  };
};

type Player = {
  id: string;
  user_id: string | null;
  guest_username: string | null;
  score: number;
  correct_count: number;
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

interface WaitingRoomClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
  isOwner: boolean;
  currentUserId: string | null; // bisa null untuk guest
  currentPlayerId?: string;
}

export function WaitingRoomClient({
  sessionId,
  session,
  players: initialPlayers,
  isOwner,
  currentUserId,
  currentPlayerId,
}: WaitingRoomClientProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [starting, setStarting] = useState(false);
  const supabase = createClient();

  // Function to fetch all players with profiles
  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("game_players")
      .select("*, profiles(*)")
      .eq("game_session_id", sessionId)
      .order("score", { ascending: false });
    if (data) {
      setPlayers(data as Player[]);
    }
  };

  useEffect(() => {
    // Subscribe to changes in game_players
    const channel = supabase
      .channel(`game_players:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_session_id=eq.${sessionId}`,
        },
        () => {
          // Refresh all players when any change happens
          fetchPlayers();
        }
      )
      .subscribe();

    // Subscribe to changes in game_sessions
    const sessionChannel = supabase
      .channel(`game_sessions:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setSessionStatus(newStatus);
          if (newStatus === "active") {
            router.push(`/game/${sessionId}/play`);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      sessionChannel.unsubscribe();
    };
  }, [sessionId, supabase, router]);

  const handleStartGame = async () => {
    setStarting(true);
    const res = await startGameSession({ gameSessionId: sessionId });
    if (res.ok) {
      router.push(`/game/${sessionId}/play`);
    } else {
      alert(res.error);
      setStarting(false);
    }
  };

  const canStart = players.length >= session.min_players && sessionStatus === "waiting";

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/library")}
            className="bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </button>
          <div>
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline">
              {session.quizzes.categories.name}
            </p>
            <p className="font-headline-md text-headline-md leading-tight">
              {session.quizzes.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary-container border-2 border-on-background px-4 py-1 neo-shadow-sm flex items-center gap-2">
            <MaterialIcon name="group" filled className="text-[20px]" />
            <span className="font-label-bold text-label-bold">
              {players.length} / {session.min_players}+
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center p-margin md:p-gutter max-w-container-max mx-auto w-full">
        <div className="w-full max-w-2xl">
          {/* Status */}
          <div className="text-center mb-8">
            <div
              className={`inline-block border-4 border-on-background px-6 py-3 font-headline-md text-headline-md neo-shadow-md ${
                sessionStatus === "waiting"
                  ? "bg-tertiary-container"
                  : "bg-secondary-container"
              }`}
            >
              {sessionStatus === "waiting" ? "MENUNGGU PEMAIN" : "GAME DIMULAI"}
            </div>
          </div>

          {/* Players List */}
          <div className="bg-surface border-4 border-on-background neo-shadow-md p-6">
            <h2 className="font-headline-md text-headline-md mb-6 text-center">
              Pemain Bergabung
            </h2>

            <div className="space-y-3">
              {players.map((player, index) => {
                // Tentukan nama pemain
                const playerName = player.user_id
                  ? player.profiles?.username || "Unknown"
                  : player.guest_username || "Guest";
                
                // Tentukan apakah ini current player (untuk guest, kita gunakan currentPlayerId)
                const isCurrentPlayer =
                  (currentUserId && player.user_id === currentUserId) ||
                  (currentPlayerId && player.id === currentPlayerId);

                // Tentukan apakah ini owner
                const isOwner = player.user_id && player.user_id === session.owner_id;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 border-4 border-on-background ${
                      isCurrentPlayer
                        ? "bg-primary-container"
                        : "bg-surface-container"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-on-background text-surface font-headline-md text-headline-md rounded-full">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-body-lg text-body-lg font-bold">
                        {playerName}
                      </p>
                      {isCurrentPlayer && (
                        <p className="font-label-bold text-label-bold text-outline">
                          Anda
                        </p>
                      )}
                    </div>
                    {isOwner && (
                      <div className="bg-secondary-container border-2 border-on-background px-3 py-1 font-label-bold text-label-bold">
                        OWNER
                      </div>
                    )}
                  </div>
                );
              })}

              {players.length === 0 && (
                <div className="text-center py-8 font-body-lg text-body-lg text-outline">
                  Belum ada pemain bergabung
                </div>
              )}
            </div>
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className="mt-8 text-center">
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className="neo-button-primary px-8 py-4 font-headline-md text-headline-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {starting
                  ? "MEMULAI..."
                  : canStart
                  ? "MULAI GAME"
                  : `BUTUH ${session.min_players} PEMAIN`}
              </button>
              {!canStart && (
                <p className="mt-4 font-label-bold text-label-bold text-outline">
                  Bagikan kode game ini ke pemain lain
                </p>
              )}
            </div>
          )}

          {/* Share Code */}
          <div className="mt-8 text-center">
            <p className="font-label-bold text-label-bold text-outline mb-2">
              Kode Game
            </p>
            <div className="inline-block bg-on-background text-surface px-6 py-3 font-headline-md text-headline-md neo-shadow-sm">
              {sessionId.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
