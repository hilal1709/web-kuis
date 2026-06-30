"use client";

import { useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "default",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface border-4 border-on-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-4">
          {variant === "danger" && (
            <MaterialIcon name="warning" className="text-4xl text-error" />
          )}
          <h3 className="font-headline-md text-headline-md">{title}</h3>
        </div>
        <p className="text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border-4 border-on-background bg-surface-container text-on-surface font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 border-4 border-on-background font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${
              variant === "danger"
                ? "bg-error text-on-error"
                : "bg-primary text-on-primary"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
