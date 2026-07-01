import { ResultsSummary } from "../ResultsSummary";

function parseNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseText(value: string | string[] | undefined, fallback: string) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw : fallback;
}

export default async function AttemptResultsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <ResultsSummary
      title={parseText(params.quiz, "Kuis")}
      categoryName={parseText(params.category, "Umum")}
      score={parseNumber(params.score)}
      correctCount={parseNumber(params.correct)}
      totalCount={parseNumber(params.total)}
      timeTaken={parseNumber(params.time)}
      subtitle="Mode pratinjau hasil saat penyimpanan gagal."
    />
  );
}
