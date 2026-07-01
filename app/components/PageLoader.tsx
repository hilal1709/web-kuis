import { MaterialIcon } from "./MaterialIcon";

/**
 * Loader layar penuh untuk fallback Suspense pada perpindahan halaman
 * (dipakai oleh file loading.tsx). Memberi indikasi visual instan supaya
 * navigasi tidak terasa "diam/berat".
 */
export function PageLoader({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-on-background">
      <div className="w-14 h-14 border-4 border-on-background bg-primary-container neo-shadow-md flex items-center justify-center">
        <MaterialIcon name="progress_activity" filled className="animate-spin text-[28px]" />
      </div>
      <p className="font-label-bold text-label-bold uppercase tracking-wider text-outline">
        {label}
      </p>
    </div>
  );
}
