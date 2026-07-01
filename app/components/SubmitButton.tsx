"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { MaterialIcon } from "./MaterialIcon";

interface SubmitButtonProps {
  children: ReactNode;
  className?: string;
  /** Teks yang ditampilkan saat proses berjalan (default: pakai children) */
  pendingText?: ReactNode;
}

/**
 * Tombol submit yang otomatis menampilkan spinner + nonaktif selama server
 * action form induknya berjalan. Mencegah klik ganda dan memberi kepastian
 * ke user bahwa tombolnya sudah ditekan.
 */
export function SubmitButton({
  children,
  className = "",
  pendingText,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:opacity-70 disabled:cursor-wait`}
    >
      {pending ? (
        <>
          <MaterialIcon name="progress_activity" className="animate-spin" />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
