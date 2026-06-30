"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { Modal } from "@/app/components/Modal";
import { endGameSession, toggleGameSessionHidden } from "@/app/game/actions";
import type { GameSession, Quiz } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  waiting: "Menunggu Pemain",
  active: "Sedang Berlangsung",
  completed: "Selesai",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  waiting: "bg-yellow-100 text-yellow-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

interface GameSessionCardProps {
  session: GameSession & { quizzes?: Quiz | null; hidden?: boolean };
  isHidden?: boolean;
}

export function GameSessionCard({ session, isHidden = false }: GameSessionCardProps) {
  const isActiveOrWaiting = session.status === "active" || session.status === "waiting";
  const [showEndModal, setShowEndModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);

  const handleEndGame = async () => {
    const res = await endGameSession(session.id);
    if (res.ok) {
      redirect("/library");
    }
  };

  const handleHideGame = async () => {
    const res = await toggleGameSessionHidden({ gameSessionId: session.id, hidden: true });
    if (res.ok) {
      redirect("/library");
    }
  };

  const handleUnhideGame = async () => {
    const res = await toggleGameSessionHidden({ gameSessionId: session.id, hidden: false });
    if (res.ok) {
      redirect("/library");
    }
  };

  return (
    <>
      <div className="bg-surface border-4 border-on-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-headline-md text-headline-md">
              {session.quizzes?.title || "Kuis Tanpa Judul"}
            </h3>
            <span
              className={`px-3 py-1 border-2 border-on-background font-label-bold text-[12px] uppercase ${STATUS_BADGE_CLASSES[session.status] || "bg-gray-100 text-gray-800"}`}
            >
              {STATUS_LABELS[session.status] || session.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="font-label-bold text-[11px] uppercase bg-surface-container-high px-2 py-0.5 border border-on-background">
              Kode Game: {session.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
            </span>
            <span className="font-label-bold">
              {new Date(session.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {!isHidden && session.status === "waiting" && (
            <Link
              href={`/game/${session.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-tertiary text-on-background border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase"
            >
              <MaterialIcon name="play_arrow" />
              Lanjutkan
            </Link>
          )}
          {!isHidden && session.status === "active" && (
            <Link
              href={`/game/${session.id}/play`}
              className="flex items-center gap-2 px-6 py-3 bg-tertiary text-on-background border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase"
            >
              <MaterialIcon name="play_arrow" />
              Lanjutkan
            </Link>
          )}
          {session.status === "completed" && (
            <Link
              href={`/game/${session.id}/results`}
              className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase"
            >
              <MaterialIcon name="assessment" />
              Lihat Hasil
            </Link>
          )}
          {!isHidden && isActiveOrWaiting && (
            <button
              onClick={() => setShowEndModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-error text-on-error border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <MaterialIcon name="stop" />
              Akhiri
            </button>
          )}
          {!isHidden ? (
            <button
              onClick={() => setShowHideModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-outline text-on-surface border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <MaterialIcon name="visibility_off" />
              Sembunyikan
            </button>
          ) : (
            <button
              onClick={handleUnhideGame}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary border-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-label-bold uppercase active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <MaterialIcon name="visibility" />
              Tampilkan
            </button>
          )}
        </div>
      </div>
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndGame}
        title="Akhiri Game?"
        message={`Yakin ingin mengakhiri game "${session.quizzes?.title || "Tanpa Judul"}"? Semua pemain akan keluar dan hasil akan disimpan.`}
        confirmText="Akhiri"
        cancelText="Batal"
        variant="danger"
      />
      <Modal
        isOpen={showHideModal}
        onClose={() => setShowHideModal(false)}
        onConfirm={handleHideGame}
        title="Sembunyikan Game?"
        message={`Yakin ingin menyembunyikan game "${session.quizzes?.title || "Tanpa Judul"}"? Game akan dipindahkan ke tab "Tersembunyi".`}
        confirmText="Sembunyikan"
        cancelText="Batal"
        variant="default"
      />
    </>
  );
}
