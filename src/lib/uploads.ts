import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 1_500_000;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function decodeImageDataUrl(dataUrl: string): { buffer: Buffer; ext: string } {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(
    dataUrl.trim(),
  );
  if (!match) throw new Error("Upload a JPEG, PNG, WebP, or GIF image");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 16 || buffer.length > MAX_BYTES) {
    throw new Error("Image must be under 1.5MB");
  }
  return { buffer, ext: MIME_EXT[match[1]] };
}

export async function saveImageUpload(
  kind: "hero" | "category" | "product",
  id: string,
  dataUrl: string,
): Promise<string> {
  const { buffer, ext } = decodeImageDataUrl(dataUrl);
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  if (!safeId) throw new Error("Invalid image target");
  const filename = `${safeId}-${Date.now()}.${ext}`;
  const dir = path.join(UPLOAD_ROOT, kind);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${kind}/${filename}`;
}

export async function deleteManagedUpload(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const abs = path.resolve(process.cwd(), "public", publicPath.replace(/^\/+/, ""));
  const root = path.resolve(UPLOAD_ROOT);
  if (abs !== root && !abs.startsWith(root + path.sep)) return;
  await unlink(abs).catch(() => undefined);
}
