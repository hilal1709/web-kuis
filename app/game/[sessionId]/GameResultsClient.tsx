"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Confetti } from "@/app/components/Confetti";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { gsap, EASE_OUT, EASE_BOUNCE, countUp } from "@/lib/gsap";

type Session = {
  id: string;
  status: string;
  owner_id: string;
  quizzes: {
    title: string;
    categories: { name: string };
  };
};

type Player = {
  id: string;
  user_id: string | null;
  guest_username: string | null;
  score: number;
  correct_count: number;
  profiles?: { username: string; avatar_url: string | null } | null;
};

interface GameResultsClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
  currentUserId: string | null;
  currentPlayerId?: string;
}

export function GameResultsClient({
  sessionId,
  session,
  players,
  currentUserId,
  currentPlayerId,
}: GameResultsClientProps) {
  const router = useRouter();

  const isGuest = !currentUserId;
  const isCurrentPlayer = (p: Player) =>
    (!!currentUserId && p.user_id === currentUserId) ||
    (!!currentPlayerId && p.id === currentPlayerId);
  const getPlayerName = (p: Player) =>
    p.user_id ? p.profiles?.username || "Unknown" : p.guest_username || "Guest";

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = sortedPlayers.find(isCurrentPlayer);
  const currentRank = sortedPlayers.findIndex(isCurrentPlayer) + 1;
  const isOwner = !!currentUserId && session.owner_id === currentUserId;

  // Refs
  const resultCardRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLHeadingElement>(null);
  const scoreRef = useRef<HTMLParagraphElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

    // Result card entrance
    if (resultCardRef.current) {
      tl.fromTo(resultCardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      );
    }

    // Trophy bounce pop
    if (trophyRef.current) {
      tl.fromTo(trophyRef.current,
        { scale: 0, rotate: -15 },
        { scale: 1, rotate: 0, duration: 0.5, ease: EASE_BOUNCE },
        "-=0.3"
      );
    }

    // Score count-up
    if (scoreRef.current && currentPlayer) {
      tl.add(() => {
        countUp(
          scoreRef.current,
          currentPlayer.score,
          0.9,
          (v) => `${v.toLocaleString("id-ID")} Poin`,
        );
      }, "-=0.2");
    }

    // Leaderboard rows stagger
    if (leaderboardRef.current) {
      const rows = leaderboardRef.current.querySelectorAll("[data-row]");
      tl.fromTo(rows,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: EASE_OUT },
        "-=0.3"
      );
    }

    // Actions pop in
    if (actionsRef.current) {
      tl.fromTo(actionsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2"
      );
    }

    return () => { tl.kill(); };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Confetti />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(isGuest ? "/" : "/library")}
            className="shrink-0 bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </button>
          <div className="min-w-0">
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline truncate">
              {session.quizzes.categories.name}
            </p>
            <p className="font-headline-md text-headline-md leading-tight truncate">
              {session.quizzes.title}
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-grow flex flex-col items-center p-margin md:p-gutter pb-8 md:pb-12 max-w-container-max mx-auto w-full">
        <div className="w-full max-w-2xl py-4 md:py-8">

          {/* Badges */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-tertiary-container border-2 border-on-background px-4 py-2 font-label-bold text-label-bold uppercase neo-shadow-sm flex items-center gap-2">
              <MaterialIcon name="celebration" filled className="text-[18px]" />
              Hasil Akhir Live
            </div>
            <div className="bg-secondary-container border-2 border-on-background px-4 py-2 font-label-bold text-label-bold uppercase neo-shadow-sm">
              {players.length} Pemain
            </div>
          </div>

          {/* Your Result */}
          {currentPlayer ? (
            <div ref={resultCardRef} className="bg-primary-container border-4 border-on-background neo-shadow-md p-6 mb-6 text-center">
              <div ref={trophyRef as any} className="inline-block">
                <MaterialIcon
                  name="emoji_events"
                  filled
                  className="text-[56px] mb-3"
                />
              </div>
              <h1 ref={rankRef} className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">
                Peringkat #{currentRank}
              </h1>
              <p ref={scoreRef} className="font-headline-md text-headline-md mb-4">
                {currentPlayer.score.toLocaleString("id-ID")} Poin
              </p>
              <div className="flex justify-center gap-6 md:gap-8">
                <div>
                  <p className="font-label-bold text-label-bold text-outline">Benar</p>
                  <p className="font-headline-md text-headline-md">{currentPlayer.correct_count}</p>
                </div>
                <div className="w-px bg-on-background" />
                <div>
                  <p className="font-label-bold text-label-bold text-outline">Total Pemain</p>
                  <p className="font-headline-md text-headline-md">{players.length}</p>
                </div>
              </div>
            </div>
          ) : isOwner ? (
            <div ref={resultCardRef} className="bg-tertiary-container border-4 border-on-background neo-shadow-md p-6 mb-6 text-center">
              <MaterialIcon name="emoji_events" filled className="text-[56px] mb-3" />
              <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">Game Selesai!</h1>
              <p className="font-headline-md text-headline-md mb-2">Terima kasih telah menjadi host!</p>
            </div>
          ) : null}

          {/* Leaderboard */}
          <div ref={leaderboardRef} className="bg-surface border-4 border-on-background neo-shadow-md p-4 md:p-6">
            <h2 className="font-headline-md text-headline-md mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
              <MaterialIcon name="leaderboard" filled />
              Papan Peringkat Akhir
            </h2>
            <div className="space-y-2 md:space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  data-row
                  className={`flex items-center gap-3 p-3 md:p-4 border-4 border-on-background ${
                    index === 0
                      ? "bg-tertiary-container"
                      : index === 1
                      ? "bg-secondary-container"
                      : index === 2
                      ? "bg-primary-container"
                      : isCurrentPlayer(player)
                      ? "bg-surface-container-high"
                      : "bg-surface-container"
                  }`}
                >
                  <div className="w-9 h-9 md:w-12 md:h-12 shrink-0 flex items-center justify-center bg-on-background text-surface font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md rounded-full">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg font-bold truncate">
                      {getPlayerName(player)}
                    </p>
                    {isCurrentPlayer(player) && (
                      <p className="font-label-bold text-label-bold text-outline">Anda</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md">
                      {player.score.toLocaleString("id-ID")}
                    </p>
                    <p className="font-label-bold text-label-bold text-outline">{player.correct_count} benar</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div ref={actionsRef} className="mt-6 md:mt-8 flex flex-col gap-3 md:flex-row md:gap-4 md:justify-center">
            {isGuest ? (
              <>
                <button
                  onClick={() => router.push("/")}
                  className="w-full md:w-auto neo-button-primary px-8 py-4 font-headline-md text-headline-md"
                >
                  KEMBALI KE HOME
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full md:w-auto bg-secondary-container border-4 border-on-background px-8 py-4 font-headline-md text-headline-md neo-shadow-sm btn-interact"
                >
                  BUAT AKUN GRATIS
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/library")}
                  className="w-full md:w-auto neo-button-primary px-8 py-4 font-headline-md text-headline-md"
                >
                  KEMBALI KE LIBRARY
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sessionId.slice(0, 8).toUpperCase());
                    alert("Kode game disalin!");
                  }}
                  className="w-full md:w-auto bg-surface-container border-4 border-on-background px-8 py-4 font-headline-md text-headline-md neo-shadow-sm btn-interact"
                >
                  SALIN KODE GAME
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
