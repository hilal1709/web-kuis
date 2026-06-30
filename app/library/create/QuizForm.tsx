"use client";

import { useState } from "react";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { QuestionBuilder } from "@/app/components/QuestionBuilder";
import { ImageUpload } from "@/app/components/ImageUpload";
import { createQuiz } from "@/app/library/actions";

interface QuizFormProps {
  error?: string;
}

export function QuizForm({ error }: QuizFormProps) {
  const [coverImage, setCoverImage] = useState("");

  return (
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
            placeholder="Contoh: Assessment Teknis"
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
        <ImageUpload
          value={coverImage}
          onChange={setCoverImage}
          label="URL Gambar Cover (opsional)"
        />
        <input type="hidden" name="cover_image" value={coverImage} />
        <div className="flex items-center gap-3">
          <input
            id="is_public"
            className="w-6 h-6"
            type="checkbox"
            name="is_public"
          />
          <label htmlFor="is_public" className="font-label-bold">
            Publikasikan kuis (semua orang bisa melihat)
          </label>
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
  );
}
