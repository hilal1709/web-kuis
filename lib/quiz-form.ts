export const QUESTION_TIME_DEFAULT = 20;
export const QUESTION_TIME_MIN = 5;
export const QUESTION_TIME_MAX = 120;

export type ParsedQuestion = {
  text: string;
  correct: number;
  options: string[];
  timeLimit: number;
};

/** Baca pertanyaan dari form: q_{id}_text, q_{id}_time, q_{id}_opt_0..3, q_{id}_correct */
export function parseQuestionsFromFormData(
  formData: FormData,
  prefix = "q",
): ParsedQuestion[] {
  const ids = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(new RegExp(`^${prefix}_(\\d+)_text$`));
    if (m) ids.add(Number(m[1]));
  }

  return [...ids]
    .sort((a, b) => a - b)
    .map((id) => {
      const rawTime = Number(formData.get(`${prefix}_${id}_time`) ?? QUESTION_TIME_DEFAULT);
      const timeLimit = Number.isFinite(rawTime)
        ? Math.round(rawTime)
        : QUESTION_TIME_DEFAULT;

      return {
        text: String(formData.get(`${prefix}_${id}_text`) ?? "").trim(),
        correct: Number(formData.get(`${prefix}_${id}_correct`) ?? 0),
        options: [0, 1, 2, 3].map((j) =>
          String(formData.get(`${prefix}_${id}_opt_${j}`) ?? "").trim(),
        ),
        timeLimit,
      };
    })
    .filter((q) => q.text.length > 0);
}

export function validateQuestions(questions: ParsedQuestion[]): string | null {
  if (questions.length === 0) return "Minimal 1 pertanyaan.";
  for (let i = 0; i < questions.length; i++) {
    const n = i + 1;
    if (!questions[i].text) return `Pertanyaan ${n}: teks wajib diisi.`;
    if (questions[i].options.some((o) => !o)) {
      return `Pertanyaan ${n}: semua pilihan jawaban wajib diisi.`;
    }
    if (
      questions[i].timeLimit < QUESTION_TIME_MIN ||
      questions[i].timeLimit > QUESTION_TIME_MAX
    ) {
      return `Pertanyaan ${n}: waktu ${QUESTION_TIME_MIN}–${QUESTION_TIME_MAX} detik.`;
    }
  }
  return null;
}
