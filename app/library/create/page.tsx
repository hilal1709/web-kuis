import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/user";
import { createQuiz } from "@/app/library/actions";
import { TopNav } from "@/app/components/TopNav";
import { Footer } from "@/app/components/Footer";
import { BottomNav } from "@/app/components/BottomNav";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuestionBuilder } from "@/app/components/QuestionBuilder";

export default async function CreateQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/library/create");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <TopNav active="library" />

      <main className="flex-grow w-full max-w-2xl mx-auto pt-8 px-margin md:px-gutter pb-24">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 font-label-bold text-primary mb-6 hover:underline"
        >
          <MaterialIcon name="arrow_back" />
          KEMBALI KE LIBRARY
        </Link>

        <div className="bg-white border-4 border-on-background p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-headline-md text-headline-md mb-2">Buat Kuis Baru</h1>
          <p className="text-on-surface-variant mb-8">
            Tambah sebanyak mungkin pertanyaan sekaligus — klik{" "}
            <strong>Tambah Pertanyaan Lagi</strong> lalu simpan semuanya sekalian.
          </p>

          {error && (
            <div className="mb-6 bg-error-container text-on-error-container border-2 border-on-background px-4 py-3 font-label-bold">
              {error}
            </div>
          )}

          <form action={createQuiz} className="space-y-8">
            <section className="space-y-4">
              <h2 className="font-label-bold uppercase text-primary border-b-2 border-on-background pb-2">
                Info Kuis
              </h2>
              <div>
                <label className="font-label-bold uppercase block mb-2">
                  Judul Kuis *
                </label>
                <input
                  className="w-full neo-input p-4 bg-surface"
                  name="title"
                  placeholder="Contoh: Quiz IPA Kelas 8"
                  required
                />
              </div>
              <div>
                <label className="font-label-bold uppercase block mb-2">
                  Deskripsi
                </label>
                <textarea
                  className="w-full neo-input p-4 bg-surface min-h-[80px]"
                  name="description"
                  placeholder="Ceritakan singkat tentang kuis ini…"
                />
              </div>
              <div>
                <label className="font-label-bold uppercase block mb-2">
                  Kategori *
                </label>
                <input
                  className="w-full neo-input p-4 bg-surface"
                  name="category"
                  placeholder="Contoh: Matematika, Sains, Sejarah…"
                  required
                />
              </div>
              <div>
                <label className="font-label-bold uppercase block mb-2">
                  URL Gambar Cover (opsional)
                </label>
                <input
                  className="w-full neo-input p-4 bg-surface"
                  name="cover_image"
                  type="url"
                  placeholder="https://…"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-label-bold uppercase text-primary border-b-2 border-on-background pb-2">
                Pertanyaan
              </h2>
              <QuestionBuilder />
            </section>

            <button
              type="submit"
              className="w-full neo-button-primary py-4 font-headline-md flex items-center justify-center gap-2"
            >
              SIMPAN SEMUA PERTANYAAN
              <MaterialIcon name="save" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
      <BottomNav active="search" />
    </div>
  );
}
