"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { createClient } from "@/lib/supabase/client";
import { submitAnswer, endGameSession } from "../actions";
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
  user_id: string;
  score: number;
  correct_count: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

type GameAnswer = {
  id: string;
  game_player_id: string;
  question_id: string;
  is_correct: boolean;
};

interface LiveGameClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
  questions: Question[];
  currentPlayer: Player;
  currentUserId: string;
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
  const [index, setIndex] = useState(sessionData.current_question);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions[index]?.time_limit || 20);
  const [elapsed, setElapsed] = useState(0);
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());
  const [isEndingGame, setIsEndingGame] = useState(false);
  const supabase = createClient();

  const isOwner = sessionData.owner_id === currentUserId;
  const current = questions[index];

  // Fetch all players (with profiles) when there are changes
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

  // Fetch answers for current question
  const fetchAnswers = async (questionId: string) => {
    const { data } = await supabase
      .from("game_answers")
      .select("game_player_id, question_id")
      .eq("question_id", questionId);
    if (data) {
      setAnsweredPlayers(new Set(data.map((a) => a.game_player_id)));
    } else {
      setAnsweredPlayers(new Set());
    }
  };

  // Handle ending game manually
  const handleEndGame = async () => {
    if (!isOwner || isEndingGame) return;
    setIsEndingGame(true);
    const res = await endGameSession(sessionId);
    if (res.ok) {
      router.push(`/game/${sessionId}/results`);
    } else {
      alert(res.error);
      setIsEndingGame(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    // Fetch answers when question changes
    if (current?.id) {
      fetchAnswers(current.id);
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
          // If game is completed, redirect to results
          if (payload.new.status === "completed") {
            router.push(`/game/${sessionId}/results`);
            return;
          }
          if (payload.new.current_question !== index) {
            const newIndex = payload.new.current_question;
            setIndex(newIndex);
            setSelectedId(null);
            setLocked(false);
            setTimeLeft(questions[newIndex]?.time_limit || 20);
            // Fetch answers for new question
            if (questions[newIndex]?.id) {
              fetchAnswers(questions[newIndex].id);
            }
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
  }, [sessionId, index, questions, current?.id, supabase]);

  // Timer
  useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) {
      answer(null);
      return;
    }
    const t = setTimeout(() => {
      setTimeLeft((v) => v - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked]);

  const answer = useCallback(
    async (optionId: string | null) => {
      if (locked) return;
      setLocked(true);
      setSelectedId(optionId);

      const chosen = current?.options.find((o) => o.id === optionId);
      const isCorrect = !!chosen?.is_correct;

      await submitAnswer({
        gamePlayerId: currentPlayer.id,
        questionId: current.id,
        optionId: optionId,
        timeTaken: elapsed,
      });

      // Wait for next question or end
      setTimeout(() => {
        if (index + 1 < questions.length) {
          // Owner advances question
          if (isOwner) {
            advanceQuestion();
          }
        } else {
          // Game over
          router.push(`/game/${sessionId}/results`);
        }
      }, 2000);
    },
    [locked, current, currentPlayer.id, elapsed, index, questions.length, isOwner, router],
  );

  const advanceQuestion = async () => {
    if (index + 1 >= questions.length) {
      // End game
      await supabase
        .from("game_sessions")
        .update({ status: "completed", ended_at: new Date().toISOString() })
        .eq("id", sessionId);
      router.push(`/game/${sessionId}/results`);
      return;
    }

    await supabase
      .from("game_sessions")
      .update({ current_question: index + 1 })
      .eq("id", sessionId);
  };

  function optionClasses(optId: string, position: number) {
    if (locked) {
      const opt = current?.options.find((o) => o.id === optId);
      if (opt?.is_correct) return "bg-tertiary-fixed-dim";
      if (optId === selectedId) return "bg-error-container";
      return "bg-white opacity-60";
    }
    return `bg-white ${HOVER_BG[position] ?? ""}`;
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
      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
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
              {currentPlayer.score.toLocaleString("id-ID")}
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
                disabled={locked}
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
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 border-2 border-on-background ${
                      player.user_id === currentUserId
                        ? "bg-primary-container"
                        : "bg-surface-container"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-on-background text-surface font-headline-sm text-headline-sm rounded-full">
                      {rank + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md font-bold truncate">
                        {player.profiles.username}
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
                    {player.user_id === sessionData.owner_id && (
                      <MaterialIcon name="crown" className="text-[16px] text-tertiary-fixed" />
                    )}
                  </div>
                );
              })}
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className="mt-6 pt-4 border-t-4 border-on-background space-y-3">
              <button
                onClick={advanceQuestion}
                disabled={locked}
                className="w-full neo-button-primary px-4 py-3 font-label-bold text-label-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {index + 1 < questions.length ? "PERTANYAAN SELANJUTNYA" : "SELESAI GAME"}
              </button>
              <button
                onClick={handleEndGame}
                disabled={isEndingGame}
                className="w-full bg-error text-on-error border-4 border-on-background px-4 py-3 font-label-bold text-label-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEndingGame ? "MENGHENTIKAN..." : "AKHIRI GAME SEKARANG"}
              </button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
