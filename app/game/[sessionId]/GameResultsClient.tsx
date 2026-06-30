"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";

type Session = {
  id: string;
  status: string;
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

interface GameResultsClientProps {
  sessionId: string;
  session: Session;
  players: Player[];
  currentUserId: string;
}

export function GameResultsClient({
  sessionId,
  session,
  players,
  currentUserId,
}: GameResultsClientProps) {
  const router = useRouter();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = sortedPlayers.find((p) => p.user_id === currentUserId);
  const currentRank = sortedPlayers.findIndex((p) => p.user_id === currentUserId) + 1;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/library")}
            className="bg-surface-container-high border-2 border-on-background p-2 neo-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <MaterialIcon name="close" className="block" />
          </button>
          <div>
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline">
              {session.quizzes.categories.name}
            </p>
            <p className="font-headline-md text-headline-md leading-tight">
              {session.quizzes.title}
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center p-margin md:p-gutter max-w-container-max mx-auto w-full">
        <div className="w-full max-w-2xl">
          {/* Your Result */}
          {currentPlayer && (
            <div className="bg-primary-container border-4 border-on-background neo-shadow-md p-8 mb-8 text-center">
              <MaterialIcon name="emoji_events" filled className="text-[64px] mb-4" />
              <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-2">
                Peringkat #{currentRank}
              </h1>
              <p className="font-headline-md text-headline-md mb-4">
                {currentPlayer.score.toLocaleString("id-ID")} Poin
              </p>
              <div className="flex justify-center gap-8">
                <div>
                  <p className="font-label-bold text-label-bold text-outline">
                    Benar
                  </p>
                  <p className="font-headline-md text-headline-md">
                    {currentPlayer.correct_count}
                  </p>
                </div>
                <div className="w-px bg-on-background" />
                <div>
                  <p className="font-label-bold text-label-bold text-outline">
                    Total Pemain
                  </p>
                  <p className="font-headline-md text-headline-md">
                    {players.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-surface border-4 border-on-background neo-shadow-md p-6">
            <h2 className="font-headline-md text-headline-md mb-6 text-center flex items-center justify-center gap-2">
              <MaterialIcon name="leaderboard" filled />
              Papan Peringkat Akhir
            </h2>

            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 border-4 border-on-background ${
                    index === 0
                      ? "bg-tertiary-container"
                      : index === 1
                      ? "bg-secondary-container"
                      : index === 2
                      ? "bg-primary-container"
                      : player.user_id === currentUserId
                      ? "bg-surface-container-high"
                      : "bg-surface-container"
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-on-background text-surface font-headline-md text-headline-md rounded-full">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-body-lg text-body-lg font-bold">
                      {player.profiles.username}
                    </p>
                    {player.user_id === currentUserId && (
                      <p className="font-label-bold text-label-bold text-outline">
                        Anda
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-headline-md text-headline-md">
                      {player.score.toLocaleString("id-ID")}
                    </p>
                    <p className="font-label-bold text-label-bold text-outline">
                      {player.correct_count} benar
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/library")}
              className="neo-button-primary px-8 py-4 font-headline-md text-headline-md"
            >
              KEMBALI KE LIBRARY
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sessionId.slice(0, 8).toUpperCase());
                alert("Kode game disalin!");
              }}
              className="bg-surface-container border-4 border-on-background px-8 py-4 font-headline-md text-headline-md neo-shadow-sm btn-interact"
            >
              SALIN KODE GAME
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
