// Browser-side photo processing, so students never have to shrink files themselves.
// Every upload becomes a full-size copy (long side 1600 px, JPEG ~80%) plus a small thumbnail (480 px) for lists.
// With a real backend (Supabase Storage) this same function runs before the upload, so only the small files are sent.

export const MAX_PHOTOS = 8;
export const MAX_ORIGINAL_MB = 30;

export interface ProcessedPhoto {
  full: string; // data URL
  thumb: string; // data URL
  originalBytes: number;
  fullBytes: number;
  thumbBytes: number;
}

async function render(
  bitmap: ImageBitmap,
  longSide: number,
  quality: number,
): Promise<{ url: string; bytes: number }> {
  const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = "#fff"; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  const url = canvas.toDataURL("image/jpeg", quality);
  // data URL length is ~4/3 of the byte size
  return {
    url,
    bytes: Math.round(((url.length - url.indexOf(",") - 1) * 3) / 4),
  };
}

export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  if (!file.type.startsWith("image/"))
    throw new Error("That file isn't a picture.");
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024)
    throw new Error(`That photo is over ${MAX_ORIGINAL_MB} MB.`);
  let bitmap: ImageBitmap;
  try {
    // imageOrientation applies the phone's rotation so portrait photos don't come out sideways
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("We couldn't read that photo. Try a JPG or PNG.");
  }
  try {
    const full = await render(bitmap, 1600, 0.8);
    const thumb = await render(bitmap, 480, 0.7);
    return {
      full: full.url,
      thumb: thumb.url,
      originalBytes: file.size,
      fullBytes: full.bytes,
      thumbBytes: thumb.bytes,
    };
  } finally {
    bitmap.close();
  }
}

export const fmtBytes = (n: number) =>
  n >= 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;
