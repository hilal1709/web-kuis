"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  const current = questions[index];
  const [timeLeft, setTimeLeft] = useState(current.time_limit);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const goNext = useCallback(
    (nextScore: number, nextCorrect: number) => {
      if (index + 1 < total) {
        const ni = index + 1;
        setIndex(ni);
        setSelectedId(null);
        setLocked(false);
        setTimeLeft(questions[ni].time_limit);
      } else {
        void finish(nextScore, nextCorrect);
      }
    },
    [index, total, questions, finish],
  );

  const answer = useCallback(
    (optionId: string | null) => {
      if (locked) return;
      setLocked(true);
      setSelectedId(optionId);

      const chosen = current.options.find((o) => o.id === optionId);
      const isCorrect = !!chosen?.is_correct;

      let nextScore = score;
      let nextCorrect = correctCount;
      if (isCorrect) {
        nextScore = score + 100 + timeLeft * 10;
        nextCorrect = correctCount + 1;
        setScore(nextScore);
        setCorrectCount(nextCorrect);
      } else {
        setWrongCount((w) => w + 1);
      }

      advanceTimer.current = setTimeout(() => goNext(nextScore, nextCorrect), 1400);
    },
    [locked, current, score, correctCount, timeLeft, goNext],
  );

  // Timer per pertanyaan
  useEffect(() => {
    if (locked) return;
    if (timeLeft <= 0) {
      answer(null); // waktu habis = jawaban kosong
      return;
    }
    const t = setTimeout(() => {
      setTimeLeft((v) => v - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked, answer]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const progress = Math.round((index / total) * 100);

  function optionClasses(optId: string, position: number) {
    // setelah terkunci: hijau utk benar, merah utk pilihan salah
    if (locked) {
      const opt = current.options.find((o) => o.id === optId);
      if (opt?.is_correct) return "bg-tertiary-fixed-dim";
      if (optId === selectedId) return "bg-error-container";
      return "bg-white opacity-60";
    }
    return `bg-white ${HOVER_BG[position] ?? ""}`;
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </Link>
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
            disabled={locked}
            onClick={() => answer(null)}
            className="flex items-center gap-2 bg-surface-container border-2 border-on-background px-4 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact disabled:opacity-50"
          >
            <MaterialIcon name="skip_next" />
            Lewati
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
        <Link
          href="/library"
          className="bg-on-background text-surface border-2 border-on-background px-8 py-3 font-headline-md text-headline-md neo-shadow-sm btn-interact"
        >
          {saving ? "MENYIMPAN…" : "KELUAR"}
        </Link>
      </footer>
    </div>
  );
}
