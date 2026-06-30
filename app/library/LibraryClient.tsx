"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuizCard } from "./QuizCard";
import { GameSessionCard } from "./GameSessionCard";
import type { Category, Quiz, GameSession } from "@/lib/types";

interface LibraryClientProps {
  categories: Category[];
  quizzes: Quiz[];
  myGameSessions: GameSession[];
  myHiddenGameSessions: GameSession[];
  initialCat: string | undefined;
  created?: string;
  questionCount?: string;
}

export function LibraryClient({ categories, quizzes, myGameSessions, myHiddenGameSessions, initialCat, created, questionCount }: LibraryClientProps) {
  const [selectedCat, setSelectedCat] = useState<string | undefined>(initialCat);
  const [activeTab, setActiveTab] = useState<'active' | 'hidden'>('active');

  const filteredQuizzes = useMemo(() => {
    return selectedCat
      ? quizzes.filter(q => q.categories?.slug === selectedCat)
      : quizzes;
  }, [quizzes, selectedCat]);

  const currentGameSessions = useMemo(() => {
    return activeTab === 'active' ? myGameSessions : myHiddenGameSessions;
  }, [activeTab, myGameSessions, myHiddenGameSessions]);

  return (
    <>
      <section className="flex-grow flex flex-col gap-12">
        {/* Game Sessions */}
        <div>
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
                Riwayat Game Live
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Game live yang pernah Anda buat.
              </p>
            </div>
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${activeTab === 'active' ? 'bg-secondary-container neo-shadow-sm' : 'bg-surface hover:bg-surface-container-high'}`}
              >
                Aktif
              </button>
              <button
                onClick={() => setActiveTab('hidden')}
                className={`px-4 py-2 border-2 border-on-background font-label-bold text-[12px] uppercase transition-all ${activeTab === 'hidden' ? 'bg-secondary-container neo-shadow-sm' : 'bg-surface hover:bg-surface-container-high'}`}
              >
                Tersembunyi
              </button>
            </div>
          </header>

          {/* Game Sessions List */}
          {currentGameSessions.length === 0 ? (
            <div className="col-span-full border-4 border-dashed border-on-background p-12 text-center">
              <MaterialIcon name="history_toggle_off" className="text-6xl text-outline-variant mx-auto mb-4" />
              <p className="font-headline-md text-on-surface-variant">
                {activeTab === 'active' ? "Belum ada riwayat game live" : "Tidak ada game yang disembunyikan"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentGameSessions.map((session) => (
              <GameSessionCard key={session.id} session={session as any} isHidden={activeTab === 'hidden'} />
            ))}
            </div>
          )}
        </div>

        {/* My Quizzes */}
        <div>
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-on-background leading-none">
                Koleksi Kuis Saya
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Assessment yang Anda buat.
              </p>
              {created === "1" && (
                <p className="mt-2 font-label-bold text-primary">
                  Kuis berhasil dibuat
                  {questionCount
                    ? ` dengan ${questionCount} pertanyaan`
                    : ""}
                  !
                </p>
              )}
            </div>
            <Link
              href="/library/create"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary border-4 border-on-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-label-bold uppercase"
            >
              <MaterialIcon name="add_circle" />
              Buat Assessment
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuizzes.map((quiz: Quiz, i: number) => (
              <QuizCard key={quiz.id} quiz={quiz as any} index={i} />
            ))}

            {filteredQuizzes.length === 0 && (
              <div className="col-span-full border-4 border-dashed border-on-background p-12 text-center">
                <MaterialIcon
                  name="quiz"
                  className="text-6xl text-outline-variant"
                />
                <p className="font-headline-md text-on-surface-variant mt-4">
                  {selectedCat
                    ? "Belum ada assessment di kategori ini."
                    : "Belum ada assessment."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
