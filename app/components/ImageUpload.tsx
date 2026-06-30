"use client";

import { useState, useRef } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "URL Gambar Cover" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal upload gambar");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload gambar. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="font-label-bold uppercase block mb-2">
        {label}
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-48 object-cover border-4 border-on-background"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-error text-on-error px-3 py-1 border-2 border-on-background font-label-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Hapus
          </button>
        </div>
      ) : (
        <div className="border-4 border-dashed border-on-background p-8 text-center">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex flex-col items-center gap-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
          >
            <MaterialIcon name="cloud_upload" className="text-4xl" />
            <span className="font-label-bold">
              {isUploading ? "Mengupload..." : "Upload Gambar"}
            </span>
            <span className="text-sm">atau masukkan URL di bawah</span>
          </button>
        </div>
      )}

      <input
        className="w-full neo-input p-4 bg-surface mt-4"
        name="cover_image"
        type="url"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
