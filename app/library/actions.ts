"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseQuestionsFromFormData,
  validateQuestions,
  type ParsedQuestion,
} from "@/lib/quiz-form";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40) || "umum"
  );
}

async function getOrCreateCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
): Promise<{ id: string } | { error: string }> {
  const slug = slugify(name);
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return { id: existing.id };

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), slug, icon: "category" })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Gagal buat kategori." };
  return { id: data.id };
}

async function insertQuestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  quizId: string,
  questions: ParsedQuestion[],
  startPosition: number,
): Promise<{ error: string } | { ok: true }> {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const { data: question, error: qErr } = await supabase
      .from("questions")
      .insert({
        quiz_id: quizId,
        question_text: q.text,
        position: startPosition + i,
        time_limit: q.timeLimit,
      })
      .select("id")
      .single();

    if (qErr || !question) {
      return { error: qErr?.message ?? `Gagal simpan pertanyaan ${i + 1}.` };
    }

    const { error: optErr } = await supabase.from("options").insert(
      q.options.map((text, pos) => ({
        question_id: question.id,
        option_text: text,
        is_correct: pos === q.correct,
        position: pos,
      })),
    );

    if (optErr) return { error: optErr.message };
  }

  return { ok: true };
}

export async function createQuiz(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/library/create");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryName = String(formData.get("category") ?? "").trim();
  const coverImage = String(formData.get("cover_image") ?? "").trim();
  const questions = parseQuestionsFromFormData(formData);

  const fail = (msg: string) =>
    redirect(`/library/create?error=${encodeURIComponent(msg)}`);

  if (!title || !categoryName) fail("Judul dan kategori wajib diisi.");

  const validationErr = validateQuestions(questions);
  if (validationErr) fail(validationErr);

  const category = await getOrCreateCategory(supabase, categoryName);
  if ("error" in category) fail(category.error);

  const categoryId = (category as { id: string }).id;

  const { data: quiz, error: quizErr } = await supabase
    .from("quizzes")
    .insert({
      title,
      description: description || null,
      category_id: categoryId,
      cover_image: coverImage || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (quizErr || !quiz) fail(quizErr?.message ?? "Gagal menyimpan kuis.");

  const inserted = await insertQuestions(supabase, quiz!.id, questions, 0);
  if ("error" in inserted) fail(inserted.error);

  revalidatePath("/library");
  revalidatePath("/");
  redirect(
    `/library?created=1&questions=${questions.length}`,
  );
}

async function assertQuizOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  quizId: string,
  userId: string,
) {
  const { data } = await supabase
    .from("quizzes")
    .select("id, title, created_by")
    .eq("id", quizId)
    .single();

  if (!data || data.created_by !== userId) return null;
  return data;
}

export async function addQuestions(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const quizId = String(formData.get("quiz_id") ?? "").trim();
  if (!user) redirect(`/login?redirect=/library/${quizId}/edit`);

  const fail = (msg: string) =>
    redirect(`/library/${quizId}/edit?error=${encodeURIComponent(msg)}`);

  const quiz = await assertQuizOwner(supabase, quizId, user.id);
  if (!quiz) fail("Kuis tidak ditemukan atau bukan milik kamu.");

  const questions = parseQuestionsFromFormData(formData);
  const validationErr = validateQuestions(questions);
  if (validationErr) fail(validationErr);

  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  const inserted = await insertQuestions(
    supabase,
    quizId,
    questions,
    count ?? 0,
  );
  if ("error" in inserted) fail(inserted.error);

  revalidatePath("/library");
  revalidatePath(`/library/${quizId}/edit`);
  revalidatePath(`/play/${quizId}`);
  redirect(
    `/library/${quizId}/edit?added=${questions.length}`,
  );
}
