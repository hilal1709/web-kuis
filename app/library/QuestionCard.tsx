"use client";

import { useState, useRef } from "react";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { Modal } from "@/app/components/Modal";
import { deleteQuestion } from "@/app/library/actions";
import type { Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: Question;
  index: number;
  quizId: string;
}

export function QuestionCard({ question, index, quizId }: QuestionCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirmDelete = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <div
        key={question.id}
        className="bg-surface border-4 border-on-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-label-bold text-primary">#{index + 1}</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] font-label-bold uppercase bg-secondary-container border border-on-background px-2 py-0.5">
              <MaterialIcon name="timer" className="text-[14px]" />
              {question.time_limit}s
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-error hover:bg-error-container transition-colors"
            >
              <MaterialIcon name="delete" />
            </button>
          </div>
        </div>
        <p className="font-body-md mb-3">{question.question_text}</p>
        <ul className="space-y-1 text-sm">
          {question.options.map((opt, i) => (
            <li
              key={opt.id}
              className={
                opt.is_correct
                  ? "font-label-bold text-primary"
                  : "text-on-surface-variant"
              }
            >
              {LETTERS[i]}. {opt.option_text}
              {opt.is_correct && " ✓"}
            </li>
          ))}
        </ul>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pertanyaan?"
        message={`Yakin ingin menghapus pertanyaan #${index + 1}? Aksi ini tidak bisa dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
      <form action={deleteQuestion} ref={formRef} className="hidden">
        <input type="hidden" name="quiz_id" value={quizId} />
        <input type="hidden" name="question_id" value={question.id} />
      </form>
    </>
  );
}
