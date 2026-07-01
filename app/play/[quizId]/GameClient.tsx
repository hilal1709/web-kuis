"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuizBackgroundMusic } from "@/app/components/QuizBackgroundMusic";
import { saveAttempt } from "@/app/play/actions";
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

type Response = {
  status: "unanswered" | "answered" | "skipped" | "timeout";
  selectedId: string | null;
  timeLeft: number;
};

export function GameClient({
  quizId,
  categoryName,
  quizTitle,
  questions,
}: {
  quizId: string;
  categoryName: string;
  quizTitle: string;
  questions: Question[];
}) {
  const router = useRouter();
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>(
    () =>
      questions.map((q) => ({
        status: "unanswered",
        selectedId: null,
        timeLeft: q.time_limit,
      })) ?? [],
  );
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  const current = questions[index];
  const currentResponse = responses[index];
  const timeLeft = currentResponse?.timeLeft ?? current.time_limit;
  const locked = currentResponse?.status !== "unanswered";
  const revealAnswer = currentResponse?.status === "answered";
  const selectedId = currentResponse?.selectedId ?? null;

  const finish = useCallback(
    async (finalScore: number, finalCorrect: number) => {
      setSaving(true);
      const res = await saveAttempt({
        quizId,
        score: finalScore,
        correctCount: finalCorrect,
        totalCount: total,
        timeTaken: elapsed,
      });
      if (res.ok) {
        router.push(`/results/${res.attemptId}`);
      } else {
        const qs = new URLSearchParams({
          score: String(finalScore),
          correct: String(finalCorrect),
          total: String(total),
          time: String(elapsed),
          quiz: quizTitle,
        });
        router.push(`/results/preview?${qs.toString()}`);
      }
    },
    [quizId, total, elapsed, router, quizTitle],
  );

  const canGoNext = useMemo(() => {
    if (saving) return false;
    return currentResponse?.status !== "unanswered";
  }, [currentResponse?.status, saving]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    if (index + 1 < total) {
      setIndex((v) => v + 1);
      return;
    }
    void finish(score, correctCount);
  }, [canGoNext, index, total, finish, score, correctCount]);

  const goPrevOrExit = useCallback(() => {
    if (saving) return;
    if (index > 0) {
      setIndex((v) => Math.max(0, v - 1));
      return;
    }
    router.push("/library");
  }, [index, router, saving]);

  const answer = useCallback(
    (optionId: string) => {
      if (saving) return;
      const resp = responses[index];
      if (!resp || resp.status !== "unanswered") return;

      const chosen = current.options.find((o) => o.id === optionId);
      const isCorrect = !!chosen?.is_correct;

      setResponses((prev) => {
        const copy = [...prev];
        copy[index] = { ...resp, status: "answered", selectedId: optionId };
        return copy;
      });

      if (isCorrect) {
        setScore((v) => v + 100 + timeLeft * 10);
        setCorrectCount((v) => v + 1);
      } else {
        setWrongCount((v) => v + 1);
      }
    },
    [current.options, index, responses, saving, timeLeft],
  );

  const skip = useCallback(() => {
    if (saving) return;
    const resp = responses[index];
    if (!resp || resp.status !== "unanswered") return;
    setResponses((prev) => {
      const copy = [...prev];
      copy[index] = { ...resp, status: "skipped", selectedId: null };
      return copy;
    });
    if (index + 1 < total) {
      setIndex((v) => v + 1);
      return;
    }
    void finish(score, correctCount);
  }, [correctCount, finish, index, responses, saving, score, total]);

  // Timer per pertanyaan
  useEffect(() => {
    if (saving) return;
    if (currentResponse?.status !== "unanswered") return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => {
      setResponses((prev) => {
        const resp = prev[index];
        if (!resp || resp.status !== "unanswered") return prev;
        const nextTimeLeft = Math.max(0, resp.timeLeft - 1);
        const copy = [...prev];
        copy[index] = {
          ...resp,
          timeLeft: nextTimeLeft,
          status: nextTimeLeft === 0 ? "timeout" : resp.status,
          selectedId: nextTimeLeft === 0 ? null : resp.selectedId,
        };
        return copy;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, currentResponse?.status, index, saving]);

  const progress = Math.round((index / total) * 100);

  function optionClasses(optId: string, position: number) {
    // setelah terkunci: hijau utk benar, merah utk pilihan salah
    if (locked) {
      const opt = current.options.find((o) => o.id === optId);
      if (revealAnswer) {
        if (opt?.is_correct) return "bg-tertiary-fixed-dim";
        if (optId === selectedId) return "bg-error-container";
        return "bg-white opacity-60";
      }
      return "bg-white opacity-60";
    }
    return `bg-white ${HOVER_BG[position] ?? ""}`;
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <QuizBackgroundMusic title="Lagu kuis" />

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
              {categoryName}
            </p>
            <p className="font-headline-md text-headline-md leading-tight">
              {quizTitle}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative w-full h-8 bg-surface border-4 border-on-background">
            <div
              className="absolute top-0 left-0 h-full bg-tertiary-fixed-dim transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-secondary-container border-2 border-on-background px-4 py-1 neo-shadow-sm flex items-center gap-2">
            <MaterialIcon name="stars" filled className="text-[20px]" />
            <span className="font-label-bold text-label-bold">
              {score.toLocaleString("id-ID")}
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

      {/* Mobile progress */}
      <div className="md:hidden w-full h-2 bg-surface border-b-2 border-on-background">
        <div
          className="h-full bg-tertiary-fixed-dim transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center p-margin md:p-gutter max-w-container-max mx-auto w-full">
        <section className="w-full mb-10 text-center">
          <div className="inline-block bg-primary-fixed border-2 border-on-background px-4 py-1 mb-6 font-label-bold text-label-bold rounded-full">
            Pertanyaan {index + 1} dari {total}
          </div>
          <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl max-w-4xl mx-auto">
            {current.question_text}
          </h1>
        </section>

        {current.image_url && (
          <div className="mb-10 w-full max-w-md aspect-video relative group">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
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
      </main>

      {/* Footer controls */}
      <footer className="w-full p-margin md:p-gutter flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <div className="flex gap-4">
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
            disabled={locked || saving}
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
            {index + 1 < total ? "Selanjutnya" : saving ? "Menyimpan…" : "Submit"}
          </button>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-on-background" />
            <span className="font-label-bold text-label-bold uppercase">
              {correctCount} Benar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error border border-on-background" />
            <span className="font-label-bold text-label-bold uppercase">
              {wrongCount} Salah
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
