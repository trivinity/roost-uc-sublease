"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  fmtBytes,
  MAX_PHOTOS,
  processPhoto,
  type ProcessedPhoto,
} from "@/lib/images";

// Pick photos of any size. Each one is compressed in the browser and gets a thumbnail automatically.
export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: ProcessedPhoto[];
  onChange: (p: ProcessedPhoto[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        setError(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      try {
        next.push(await processPhoto(file));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "We couldn't add that photo.",
        );
      }
    }
    onChange(next);
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  const saved = photos.reduce((n, p) => n + p.originalBytes - p.fullBytes, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Photos</p>
        <p className="text-xs text-muted-foreground">
          {photos.length}/{MAX_PHOTOS} · the first one is the cover
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.thumb}
              alt={`Upload ${i + 1}`}
              className="size-full object-cover"
            />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => onChange(photos.filter((_, n) => n !== i))}
              className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-brand"
          >
            <span className="flex flex-col items-center gap-1 text-xs">
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
              {busy ? "Adding…" : "Add photos"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => add(e.target.files)}
      />

      {photos.length > 0 && saved > 0 && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Compressed automatically: saved {fmtBytes(saved)} across{" "}
          {photos.length} {photos.length === 1 ? "photo" : "photos"}, thumbnails
          included.
        </p>
      )}
      {photos.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Any size works. Don&apos;t add photos and we&apos;ll show demo
          pictures.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
