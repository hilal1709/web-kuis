"use client";

import { useMemo, useState } from "react";
import { MaterialIcon } from "./MaterialIcon";

type QuizBackgroundMusicProps = {
  videoId?: string;
  title?: string;
};

export function QuizBackgroundMusic({
  videoId = "dRAWtqaszaA",
  title = "Musik Kuis",
}: QuizBackgroundMusicProps) {
  const [enabled, setEnabled] = useState(true);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      controls: "0",
      disablekb: "1",
      loop: "1",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
      playlist: videoId,
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

  return (
    <>
      {enabled ? (
        <div className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0">
          <iframe
            src={embedUrl}
            title={title}
            width="1"
            height="1"
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setEnabled((value) => !value)}
        className="fixed right-4 top-24 z-40 flex items-center gap-2 border-2 border-on-background bg-secondary-container px-3 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact md:top-auto md:bottom-4 md:px-4"
        aria-pressed={enabled}
        aria-label={enabled ? "Matikan musik" : "Nyalakan musik"}
        title={enabled ? "Matikan musik" : "Nyalakan musik"}
      >
        <MaterialIcon
          name={enabled ? "pause_circle" : "play_circle"}
          className="text-[20px]"
        />
        <span className="hidden sm:inline">{enabled ? "Musik On" : "Musik Off"}</span>
      </button>
    </>
  );
}
