"use client";

import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import {
  QUESTION_TIME_DEFAULT,
  QUESTION_TIME_MAX,
  QUESTION_TIME_MIN,
} from "@/lib/quiz-form";

const LETTERS = ["A", "B", "C", "D"];

export function QuestionBuilder({
  namePrefix = "q",
  minBlocks = 1,
}: {
  namePrefix?: string;
  minBlocks?: number;
}) {
  const [nextId, setNextId] = useState(minBlocks);
  const [blocks, setBlocks] = useState<number[]>(() =>
    Array.from({ length: minBlocks }, (_, i) => i),
  );

  const addBlock = () => {
    setBlocks((b) => [...b, nextId]);
    setNextId((n) => n + 1);
  };

  const removeBlock = (id: number) => {
    if (blocks.length <= 1) return;
    setBlocks((b) => b.filter((x) => x !== id));
  };

  return (
    <div className="space-y-6">
      {blocks.map((id, displayIndex) => (
        <div
          key={id}
          className="border-4 border-on-background p-6 bg-surface-container-low space-y-4"
        >
          <div className="flex justify-between items-center gap-4">
            <h3 className="font-label-bold uppercase text-primary">
              Pertanyaan {displayIndex + 1}
            </h3>
            {blocks.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlock(id)}
                className="flex items-center gap-1 text-error font-label-bold text-[12px] uppercase hover:underline"
              >
                <MaterialIcon name="delete" className="text-[18px]" />
                Hapus
              </button>
            )}
          </div>

          <div>
            <label className="font-label-bold uppercase block mb-2 text-sm">
              Teks Pertanyaan *
            </label>
            <textarea
              className="w-full neo-input p-4 bg-surface min-h-[90px]"
              name={`${namePrefix}_${id}_text`}
              placeholder="Tulis pertanyaan…"
              required
            />
          </div>

          <div>
            <label className="font-label-bold uppercase block mb-2 text-sm">
              Waktu Menjawab (detik)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                className="w-28 neo-input p-3 bg-surface text-center font-label-bold"
                type="number"
                name={`${namePrefix}_${id}_time`}
                min={QUESTION_TIME_MIN}
                max={QUESTION_TIME_MAX}
                defaultValue={QUESTION_TIME_DEFAULT}
                required
              />
              <span className="text-on-surface-variant text-sm font-label-bold">
                {QUESTION_TIME_MIN}–{QUESTION_TIME_MAX} detik · default{" "}
                {QUESTION_TIME_DEFAULT}s
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-label-bold uppercase text-sm">Pilihan Jawaban *</p>
            {LETTERS.map((letter, i) => (
              <div key={letter} className="flex items-center gap-3">
                <span className="w-9 h-9 flex items-center justify-center border-2 border-on-background bg-secondary-container font-headline-md text-sm shrink-0">
                  {letter}
                </span>
                <input
                  className="flex-1 neo-input p-3 bg-surface text-sm"
                  name={`${namePrefix}_${id}_opt_${i}`}
                  placeholder={`Pilihan ${letter}`}
                  required
                />
                <label className="flex items-center gap-1 font-label-bold text-[11px] uppercase shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name={`${namePrefix}_${id}_correct`}
                    value={String(i)}
                    defaultChecked={i === 0}
                    className="w-4 h-4 accent-primary"
                  />
                  Benar
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="w-full flex items-center justify-center gap-2 py-3 border-4 border-dashed border-on-background bg-surface font-label-bold uppercase hover:bg-secondary-container transition-colors"
      >
        <MaterialIcon name="add_circle" />
        Tambah Pertanyaan Lagi
      </button>
    </div>
  );
}
