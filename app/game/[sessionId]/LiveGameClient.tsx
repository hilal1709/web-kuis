"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuizBackgroundMusic } from "@/app/components/QuizBackgroundMusic";
import { createClient } from "@/lib/supabase/client";
import { submitAnswer } from "../actions";
import type { Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];
const LETTER_BG = [
  "bg-primary-container text-on-primary",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-error text-on-error",
];
const HOVER_BG = [
  "group-hover:bg-primary-fixed",
  "group-hover:bg-secondary-fixed",
  "group-hover:bg-tertiary-fixed",
  "group-hover:bg-error-container",
];

type Session = {
  id: string;
  status: string;
  current_question: number;
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

type Response = {
  status: "unanswered" | "answered" | "skipped" | "timeout";
  selectedId: string | null;
  timeLeft: number;
};

interface LiveGameClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
  questions: Question[];
  currentPlayer: Player;
  currentUserId: string | null; // bisa null untuk guest
}

export function LiveGameClient({
  sessionId,
  session,
  players: initialPlayers,
  questions,
  currentPlayer,
  currentUserId,
}: LiveGameClientProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [sessionData, setSessionData] = useState(session);
  const [index, setIndex] = useState(
    Math.min(Math.max(sessionData.current_question, 0), Math.max(questions.length - 1, 0)),
  );
  const [responses, setResponses] = useState<Response[]>(
    () =>
      questions.map((q) => ({
        status: "unanswered",
        selectedId: null,
        timeLeft: q.time_limit,
      })) ?? [],
  );
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  const isOwner = currentUserId && sessionData.owner_id === currentUserId;
  const current = questions[index];
  const currentResponse = responses[index];
  const selectedId = currentResponse?.selectedId ?? null;
  const locked = currentResponse?.status !== "unanswered";
  const revealAnswer = currentResponse?.status === "answered";
  const timeLeft = currentResponse?.timeLeft ?? current?.time_limit ?? 20;
  const canGoNext = !busy && currentResponse?.status !== "unanswered";
  // Data pemain saat ini yang selalu terbaru dari realtime (skor, dll)
  const me = players.find((p) => p.id === currentPlayer.id) ?? currentPlayer;

  // Fetch all players (with profiles) when there are changes
  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("game_players")
      .select("*, profiles(*)")
      .eq("game_session_id", sessionId)
      .order("score", { ascending: false });
    if (data) {
      setPlayers(data as Player[]);
    }
  }, [sessionId, supabase]);

  // Fetch answers for current question
  const fetchAnswers = useCallback(async (questionId: string) => {
    const { data } = await supabase
      .from("game_answers")
      .select("game_player_id, question_id")
      .eq("question_id", questionId);
    if (data) {
      setAnsweredPlayers(new Set(data.map((a) => a.game_player_id)));
    } else {
      setAnsweredPlayers(new Set());
    }
  }, [supabase]);

  // Subscribe to real-time updates
  useEffect(() => {
    // Fetch answers when question changes
    if (current?.id) {
      queueMicrotask(() => {
        void fetchAnswers(current.id);
      });
    }

    // Subscribe to player updates
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

    // Subscribe to session updates
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
          setSessionData((prev) => ({ ...prev, ...payload.new }));
          // Host mengakhiri game → ke halaman hasil
          if (payload.new.status === "completed") {
            router.push(`/game/${sessionId}/results`);
          }
        }
      )
      .subscribe();

    // Subscribe to answers updates
    const answersChannel = supabase
      .channel(`game_answers:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_answers",
        },
        (payload) => {
          // Only update if answer is for current question
          if (payload.new.question_id === current?.id) {
            setAnsweredPlayers((prev) => new Set([...prev, payload.new.game_player_id]));
          }
        }
      )
      .subscribe();

    return () => {
      playersChannel.unsubscribe();
      sessionChannel.unsubscribe();
      answersChannel.unsubscribe();
    };
  }, [current?.id, fetchAnswers, fetchPlayers, router, sessionId, supabase]);

  // Tandai pemain selesai (soal terakhir sudah dijawab)
  const finishGame = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await supabase
      .from("game_players")
      .update({ finished_at: new Date().toISOString() })
      .eq("id", currentPlayer.id);
    setFinished(true);
    setBusy(false);
  }, [busy, supabase, currentPlayer.id]);

  // Maju ke soal berikutnya (self-paced per pemain), atau selesai jika sudah soal terakhir
  const goNext = useCallback(() => {
    if (!canGoNext) return;
    if (index + 1 < questions.length) {
      setIndex((v) => v + 1);
      return;
    }
    void finishGame();
  }, [canGoNext, finishGame, index, questions.length]);

  const goPrevOrExit = useCallback(() => {
    if (busy) return;
    if (index > 0) {
      setIndex((v) => Math.max(0, v - 1));
      return;
    }
    router.push("/library");
  }, [busy, index, router]);

  const commitResponse = useCallback(
    async (
      optionId: string | null,
      status: Response["status"],
    ): Promise<boolean> => {
      if (busy || !current || !currentResponse || currentResponse.status !== "unanswered") {
        return false;
      }

      setBusy(true);
      const elapsed = Math.max(0, current.time_limit - timeLeft);
      const result = await submitAnswer({
        gamePlayerId: currentPlayer.id,
        questionId: current.id,
        optionId,
        timeTaken: elapsed,
      });

      if (!result.ok) {
        setBusy(false);
        return false;
      }

      setResponses((prev) => {
        const resp = prev[index];
        if (!resp || resp.status !== "unanswered") return prev;
        const copy = [...prev];
        copy[index] = { ...resp, status, selectedId: optionId };
        return copy;
      });
      setBusy(false);
      return true;
    },
    [busy, current, currentPlayer.id, currentResponse, index, timeLeft],
  );

  const answer = useCallback(
    async (optionId: string) => {
      await commitResponse(optionId, "answered");
    },
    [commitResponse],
  );

  const skip = useCallback(async () => {
    const ok = await commitResponse(null, "skipped");
    if (!ok) return;
    if (index + 1 < questions.length) {
      setIndex((v) => v + 1);
      return;
    }
    void finishGame();
  }, [commitResponse, finishGame, index, questions.length]);

  // Timer
  useEffect(() => {
    if (busy) return;
    if (currentResponse?.status !== "unanswered") return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (timeLeft <= 1) {
        void commitResponse(null, "timeout");
        return;
      }
      setResponses((prev) => {
        const resp = prev[index];
        if (!resp || resp.status !== "unanswered") return prev;
        const copy = [...prev];
        copy[index] = { ...resp, timeLeft: resp.timeLeft - 1 };
        return copy;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [busy, commitResponse, currentResponse?.status, index, timeLeft]);

  function optionClasses(optId: string, position: number) {
    if (locked) {
      const opt = current?.options.find((o) => o.id === optId);
      if (revealAnswer) {
        if (opt?.is_correct) return "bg-tertiary-fixed-dim";
        if (optId === selectedId) return "bg-error-container";
      }
      return "bg-white opacity-60";
    }
    return `bg-white ${HOVER_BG[position] ?? ""}`;
  }

  if (finished) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex((p) => p.id === currentPlayer.id) + 1;
    return (
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center p-margin">
        <div className="w-full max-w-lg bg-primary-container border-4 border-on-background neo-shadow-md p-8 text-center">
          <MaterialIcon name="check_circle" filled className="text-[64px] mb-4" />
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">
            Selesai!
          </h1>
          <p className="font-body-lg text-body-lg mb-6">
            Menunggu host mengakhiri kuis…
          </p>
          <div className="flex justify-center gap-8">
            <div>
              <p className="font-label-bold text-label-bold text-outline">Peringkat</p>
              <p className="font-headline-md text-headline-md">#{myRank}</p>
            </div>
            <div className="w-px bg-on-background" />
            <div>
              <p className="font-label-bold text-label-bold text-outline">Skor</p>
              <p className="font-headline-md text-headline-md">
                {me.score.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-headline-md">Memuat pertanyaan...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <QuizBackgroundMusic title="Lagu kuis live" />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goPrevOrExit}
            className="bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name={index > 0 ? "arrow_back" : "close"} className="block" />
          </button>
          <div className="hidden md:block">
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline">
              {sessionData.quizzes.categories.name}
            </p>
            <p className="font-headline-md text-headline-md leading-tight">
              {sessionData.quizzes.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-secondary-container border-2 border-on-background px-4 py-1 neo-shadow-sm flex items-center gap-2">
            <MaterialIcon name="stars" filled className="text-[20px]" />
            <span className="font-label-bold text-label-bold">
              {me.score.toLocaleString("id-ID")}
            </span>
          </div>
          <div
            className={`border-2 border-on-background px-4 py-1 neo-shadow-sm flex items-center gap-2 ${
              timeLeft < 10
                ? "bg-error text-on-error animate-pulse-fast"
                : "bg-error-container"
            }`}
          >
            <MaterialIcon name="timer" className="text-[20px]" />
            <span className="font-label-bold text-label-bold">{timeLeft}s</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col md:flex-row p-margin md:p-gutter max-w-container-max mx-auto w-full gap-6">
        {/* Question Area */}
        <section className="flex-1">
          <div className="mb-6">
            <div className="inline-block bg-primary-fixed border-2 border-on-background px-4 py-1 mb-4 font-label-bold text-label-bold rounded-full">
              Pertanyaan {index + 1} dari {questions.length}
            </div>
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl">
              {current.question_text}
            </h1>
          </div>

          {current.image_url && (
            <div className="mb-6 w-full max-w-md aspect-video relative group">
              <div className="absolute inset-0 bg-on-background translate-x-3 translate-y-3" />
              <div className="relative w-full h-full border-4 border-on-background bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt=""
                  src={current.image_url}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.options.map((opt, i) => (
              <button
                key={opt.id}
                disabled={locked || busy}
                onClick={() => answer(opt.id)}
                className="btn-interact group relative flex items-stretch text-left bg-white border-4 border-on-background neo-shadow-md hover:neo-shadow-lg transition-all duration-200 disabled:cursor-default"
              >
                <div
                  className={`w-16 flex items-center justify-center border-r-4 border-on-background ${LETTER_BG[i] ?? "bg-primary-container text-on-primary"}`}
                >
                  <span className="font-headline-md text-headline-md">
                    {LETTERS[i] ?? "?"}
                  </span>
                </div>
                <div
                  className={`p-6 flex-1 flex items-center transition-colors ${optionClasses(opt.id, i)}`}
                >
                  <span className="font-body-lg text-body-lg font-bold">
                    {opt.option_text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Rankings Sidebar */}
        <aside className="w-full md:w-80 bg-surface border-4 border-on-background neo-shadow-md p-4">
          <h2 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
            <MaterialIcon name="leaderboard" filled />
            Peringkat Real-time
          </h2>

          {isOwner && (
            <div className="mb-4 p-3 bg-tertiary-container border-2 border-on-background">
              <p className="font-label-bold text-label-bold">
                {answeredPlayers.size} dari {players.length} pemain sudah menjawab
              </p>
            </div>
          )}

          <div className="space-y-2">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, rank) => {
                const hasAnswered = answeredPlayers.has(player.id);
                // Tentukan nama pemain
                const playerName = player.user_id
                  ? player.profiles?.username || "Unknown"
                  : player.guest_username || "Guest";
                
                // Tentukan apakah ini current player
                const isCurrentPlayer =
                  (currentUserId && player.user_id === currentUserId) ||
                  player.id === currentPlayer.id;

                // Tentukan apakah ini owner
                const isOwnerPlayer = player.user_id && player.user_id === sessionData.owner_id;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 border-2 border-on-background ${
                      isCurrentPlayer
                        ? "bg-primary-container"
                        : "bg-surface-container"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-on-background text-surface font-headline-sm text-headline-sm rounded-full">
                      {rank + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md font-bold truncate">
                        {playerName}
                      </p>
                      <p className="font-label-bold text-label-bold text-outline">
                        {player.score} pts
                      </p>
                    </div>
                    {isOwner && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-on-background ${
                          hasAnswered ? "bg-green-500 text-white" : "bg-gray-300"
                        }`}
                      >
                        {hasAnswered && (
                          <MaterialIcon name="check" className="text-[14px]" filled />
                        )}
                      </div>
                    )}
                    {isOwnerPlayer && (
                      <MaterialIcon name="crown" className="text-[16px] text-tertiary-fixed" />
                    )}
                  </div>
                );
              })}
          </div>

        </aside>
      </main>

      <footer className="w-full p-margin md:p-gutter flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={goPrevOrExit}
            className="flex items-center gap-2 bg-surface-container border-2 border-on-background px-4 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact"
          >
            <MaterialIcon name={index > 0 ? "arrow_back" : "logout"} />
            {index > 0 ? "Kembali" : "Keluar"}
          </button>
          <button
            type="button"
            disabled={locked || busy}
            onClick={skip}
            className="flex items-center gap-2 bg-surface-container border-2 border-on-background px-4 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact disabled:opacity-50"
          >
            <MaterialIcon name="skip_next" />
            Lewati
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={goNext}
            className="flex items-center gap-2 bg-on-background text-surface border-2 border-on-background px-4 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact disabled:opacity-50"
          >
            <MaterialIcon name="arrow_forward" />
            {index + 1 < questions.length
              ? "Selanjutnya"
              : busy
                ? "Menyimpan…"
                : "Submit"}
          </button>
        </div>
      </footer>
    </div>
  );
}
