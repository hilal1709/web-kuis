"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
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
  user_id: string;
  score: number;
  correct_count: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
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
  const supabase = createClient();

  const isOwner = sessionData.owner_id === currentUserId;
  const current = questions[index];

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to player score updates
    const playersChannel = supabase
      .channel(`game_players:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_players",
          filter: `game_session_id=eq.${sessionId}`,
        },
        (payload) => {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, ...payload.new } : p
            )
          );
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
          if (payload.new.current_question !== index) {
            setIndex(payload.new.current_question);
            setSelectedId(null);
            setLocked(false);
            setTimeLeft(questions[payload.new.current_question]?.time_limit || 20);
          }
        }
      )
      .subscribe();

    return () => {
      playersChannel.unsubscribe();
      sessionChannel.unsubscribe();
    };
  }, [sessionId, index, questions, supabase]);

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

          <div className="space-y-2">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, rank) => (
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
                  {player.user_id === sessionData.owner_id && (
                    <MaterialIcon name="crown" className="text-[16px] text-tertiary-fixed" />
                  )}
                </div>
              ))}
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <div className="mt-6 pt-4 border-t-4 border-on-background">
              <button
                onClick={advanceQuestion}
                className="w-full neo-button-primary px-4 py-3 font-label-bold text-label-bold"
              >
                {index + 1 < questions.length ? "PERTANYAAN SELANJUTNYA" : "SELESAI GAME"}
              </button>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
