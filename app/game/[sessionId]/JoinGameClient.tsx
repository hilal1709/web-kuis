"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { joinGameSession } from "../actions";

type Session = {
  id: string;
  status: string;
  min_players: number;
  quizzes: {
    title: string;
    categories: {
      name: string;
    };
  };
};

interface JoinGameClientProps {
  sessionId: string;
  session: Session;
  userId: string;
}

export function JoinGameClient({
  sessionId,
  session,
  userId,
}: JoinGameClientProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    const res = await joinGameSession({ gameSessionId: sessionId });
    if (res.ok) {
      router.push(`/game/${sessionId}`);
    } else {
      alert(res.error);
      setJoining(false);
    }
  };

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
        <div className="w-full max-w-2xl text-center">
          <div className="bg-surface border-4 border-on-background neo-shadow-md p-8 mb-8">
            <MaterialIcon name="sports_esports" filled className="text-[64px] mb-4" />
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl mb-4">
              Bergabung ke Game
            </h1>
            <p className="font-body-lg text-body-lg text-outline">
              Anda akan bergabung ke sesi game ini. Pastikan Anda siap untuk
              menjawab pertanyaan!
            </p>
          </div>

          <div className="mb-8">
            <p className="font-label-bold text-label-bold text-outline mb-2">
              Kode Game
            </p>
            <div className="inline-block bg-on-background text-surface px-6 py-3 font-headline-md text-headline-md neo-shadow-sm">
              {sessionId.slice(0, 8).toUpperCase()}
            </div>
          </div>

          <div className="mb-8">
            <p className="font-label-bold text-label-bold text-outline mb-2">
              Minimal Pemain
            </p>
            <div className="inline-block bg-secondary-container border-4 border-on-background px-6 py-3 font-headline-md text-headline-md neo-shadow-sm">
              {session.min_players} Pemain
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="neo-button-primary px-8 py-4 font-headline-md text-headline-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? "BERGABUNG..." : "GABUNG SEKARANG"}
          </button>
        </div>
      </main>
    </div>
  );
}
