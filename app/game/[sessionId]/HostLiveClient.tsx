"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { createClient } from "@/lib/supabase/client";
import { gsap, EASE_OUT, EASE_BOUNCE } from "@/lib/gsap";
import { endGameSession } from "../actions";

type Session = {
  id: string;
  status: string;
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
  guest_username?: string | null;
  score: number;
  correct_count: number;
  finished_at: string | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

interface HostLiveClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
}

export function HostLiveClient({
  sessionId,
  session,
  players: initialPlayers,
}: HostLiveClientProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isEndingGame, setIsEndingGame] = useState(false);
  const supabase = createClient();
  const endedRef = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const prevScores = useRef<Record<string, number>>({});

  const finishedCount = players.filter((p) => p.finished_at).length;

  // Page entrance
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });
    if (progressRef.current) {
      tl.fromTo(progressRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4 });
    }
    if (leaderboardRef.current) {
      tl.fromTo(leaderboardRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
      const rows = leaderboardRef.current.querySelectorAll("[data-row]");
      if (rows.length) {
        tl.fromTo(rows, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.06 }, "-=0.3");
      }
    }
    return () => { tl.kill(); };
  }, []);

  // Animate score change when a player's score updates
  useEffect(() => {
    if (!leaderboardRef.current) return;
    players.forEach((p) => {
      const prev = prevScores.current[p.id] ?? 0;
      if (p.score !== prev && prev > 0) {
        const row = leaderboardRef.current!.querySelector(`[data-row="${p.id}"]`);
        if (row) {
          gsap.fromTo(row, { backgroundColor: "#fed01b" }, { backgroundColor: "transparent", duration: 0.8, ease: EASE_OUT });
        }
      }
      prevScores.current[p.id] = p.score;
    });
  }, [players]);

  // Ambil ulang semua pemain (dengan profil) tiap ada perubahan
  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("game_players")
      .select("*, profiles(*)")
      .eq("game_session_id", sessionId)
      .order("score", { ascending: false });
    if (!data) return;

    setPlayers(data as Player[]);

    // Auto-end: semua pemain sudah selesai
    if (
      !endedRef.current &&
      data.length > 0 &&
      data.every((p) => p.finished_at)
    ) {
      endedRef.current = true;
      const res = await endGameSession(sessionId);
      if (res.ok) {
        router.push(`/game/${sessionId}/results`);
      }
    }
  };

  const handleEndGame = async () => {
    if (isEndingGame) return;
    setIsEndingGame(true);
    endedRef.current = true;
    const res = await endGameSession(sessionId);
    if (res.ok) {
      router.push(`/game/${sessionId}/results`);
    } else {
      alert(res.error);
      setIsEndingGame(false);
      endedRef.current = false;
    }
  };

  useEffect(() => {
    // Ranking realtime: dengarkan perubahan skor / finished_at
    const playersChannel = supabase
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
          fetchPlayers();
        }
      )
      .subscribe();

    // Kalau sesi ditandai selesai, ke halaman hasil
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
          if (payload.new.status === "completed") {
            router.push(`/game/${sessionId}/results`);
          }
        }
      )
      .subscribe();

    return () => {
      playersChannel.unsubscribe();
      sessionChannel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="min-w-0">
          <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline truncate">
            {session.quizzes.categories.name}
          </p>
          <p className="font-headline-md text-headline-md leading-tight truncate">
            {session.quizzes.title}
          </p>
        </div>
        <div className="bg-tertiary-container border-2 border-on-background px-4 py-1 neo-shadow-sm flex items-center gap-2">
          <MaterialIcon name="cast" filled className="text-[20px]" />
          <span className="font-label-bold text-label-bold">HOST</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center p-margin md:p-gutter max-w-container-max mx-auto w-full">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div ref={progressRef} className="mb-6 p-4 bg-secondary-container border-4 border-on-background neo-shadow-md flex items-center justify-between">
            <span className="font-body-lg text-body-lg font-bold flex items-center gap-2">
              <MaterialIcon name="flag" filled />
              {finishedCount} dari {players.length} pemain selesai
            </span>
          </div>

          {/* Leaderboard */}
          <div ref={leaderboardRef} className="bg-surface border-4 border-on-background neo-shadow-md p-6">
            <h2 className="font-headline-md text-headline-md mb-6 text-center flex items-center justify-center gap-2">
              <MaterialIcon name="leaderboard" filled />
              Peringkat Real-time
            </h2>

            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  data-row={player.id}
                  className={`flex items-center gap-4 p-4 border-4 border-on-background transition-colors ${
                    index === 0
                      ? "bg-tertiary-container"
                      : index === 1
                      ? "bg-secondary-container"
                      : index === 2
                      ? "bg-primary-container"
                      : "bg-surface-container"
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-on-background text-surface font-headline-md text-headline-md rounded-full">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-lg text-body-lg font-bold truncate">
                      {player.user_id
                        ? player.profiles?.username || "Unknown"
                        : player.guest_username || "Guest"}
                    </p>
                    <p className="font-label-bold text-label-bold text-outline">
                      {player.correct_count} benar
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-headline-md text-headline-md">
                      {player.score.toLocaleString("id-ID")}
                    </p>
                    {player.finished_at && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-on-background bg-green-500 text-white">
                        <MaterialIcon name="check" className="text-[16px]" filled />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {players.length === 0 && (
                <div className="text-center py-8 font-body-lg text-body-lg text-outline">
                  Belum ada pemain
                </div>
              )}
            </div>
          </div>

          {/* End Game */}
          <div className="mt-8 text-center">
            <button
              onClick={handleEndGame}
              disabled={isEndingGame}
              className="w-full bg-error text-on-error border-4 border-on-background px-8 py-4 font-headline-md text-headline-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEndingGame ? "MENGHENTIKAN..." : "AKHIRI GAME SEKARANG"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
