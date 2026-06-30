"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { Modal } from "@/app/components/Modal";
import { formatPlays } from "@/lib/utils";
import { createGameSession } from "@/app/game/actions";
import { deleteQuiz } from "@/app/library/actions";
import type { Quiz, Category } from "@/lib/types";

const BADGE_COLORS = [
  "bg-secondary-container",
  "bg-tertiary-fixed",
  "bg-primary-fixed",
];

interface QuizCardProps {
  quiz: Quiz & { categories?: Category | null };
  index: number;
}

export function QuizCard({ quiz, index }: QuizCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    await deleteQuiz(quiz.id);
  };

  const handleCreateGame = async () => {
    const res = await createGameSession({
      quizId: quiz.id,
      minPlayers: 2,
    });
    if (res.ok) {
      redirect(`/game/${res.gameSessionId}`);
    }
  };

  return (
    <>
      <div className="group bg-surface border-4 border-on-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all">
        <div className="h-40 border-b-4 border-on-background overflow-hidden relative bg-surface-container">
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-3 py-1 ${BADGE_COLORS[index % BADGE_COLORS.length]} border-2 border-on-background font-label-bold text-[12px] uppercase`}
            >
              {quiz.categories?.name ?? "Umum"}
            </span>
          </div>
          {quiz.cover_image ? (
            <img
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt={quiz.title}
              src={quiz.cover_image}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MaterialIcon
                name="quiz"
                className="text-6xl text-outline-variant"
              />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col gap-4 flex-grow">
          <h3 className="font-headline-md text-headline-md leading-tight group-hover:text-primary transition-colors">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1">
              <MaterialIcon name="group" className="text-[18px]" />
              <span className="font-label-bold">
                {formatPlays(quiz.plays_count)} Kali
              </span>
            </div>
            <span className="font-label-bold text-[11px] uppercase bg-surface-container-high px-2 py-0.5 border border-on-background">
              Kode: {quiz.id.replace(/-/g, "").slice(0, 6).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href={`/library/${quiz.id}/edit`}
              className="w-full text-center py-3 border-4 border-on-background bg-primary-container text-on-primary-container font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Kelola Pertanyaan
            </Link>
            <button
              onClick={handleCreateGame}
              className="w-full text-center py-3 border-4 border-on-background bg-tertiary text-on-background font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
            >
              Buat Game Live
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-center py-3 border-4 border-on-background bg-error text-on-error font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              Hapus Kuis
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Kuis?"
        message={`Yakin ingin menghapus kuis "${quiz.title}"? Semua data termasuk riwayat game akan dihapus dan tidak dapat dikembalikan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
}
