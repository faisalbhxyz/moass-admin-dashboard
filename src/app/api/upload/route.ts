import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

function isValidImage(buffer: Buffer): { ok: boolean; mime: string } {
  if (buffer.length < 12) return { ok: false, mime: "" };
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ok: true, mime: "image/jpeg" };
  if (b.slice(0, 8).toString("hex") === "89504e470d0a1a0a") return { ok: true, mime: "image/png" };
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return { ok: true, mime: "image/gif" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { ok: true, mime: "image/webp" };
  return { ok: false, mime: "" };
}

/**
 * Upload image: store in MySQL (StoredImage) when DB is available.
 * Falls back to public/uploads only in local dev when DB write fails (e.g. table missing).
 * Validates: size (max 10MB), MIME, and image magic bytes.
 */
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > MAX_FILE_SIZE)
    return NextResponse.json({ error: "File too large. Maximum 10MB allowed." }, { status: 413 });

  const declaredMime = (file.type || "image/jpeg").toLowerCase();
  if (!ALLOWED_MIMES.includes(declaredMime as (typeof ALLOWED_MIMES)[number]))
    return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, GIF allowed." }, { status: 400 });

  const { ok: validImage, mime: detectedMime } = isValidImage(buffer);
  if (!validImage)
    return NextResponse.json({ error: "File is not a valid image (corrupt or wrong format)." }, { status: 400 });

  const mimeType = detectedMime;

  // Prefer MySQL (StoredImage) so images work on Vercel without Blob
  try {
    const row = await prisma.storedImage.create({
      data: { data: buffer, mimeType },
    });
    const url = `/api/image/${row.id}`;
    return NextResponse.json({ url });
  } catch (dbErr) {
    // If StoredImage table doesn't exist yet, fallback to disk only in dev
    if (process.env.VERCEL) {
      const msg =
        dbErr instanceof Error ? dbErr.message : "Upload failed";
      console.error("[upload] DB error:", dbErr);
      return NextResponse.json(
        {
          error:
            "Image upload failed. Ensure StoredImage table exists (run migration or hostinger-create-tables.sql).",
        },
        { status: 500 }
      );
    }
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      const extMap: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
      const ext = extMap[mimeType] || ".jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, name);
      await writeFile(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${name}` });
    } catch (fsErr) {
      const message = fsErr instanceof Error ? fsErr.message : "Upload failed";
      console.error("[upload] Error:", fsErr);
      return NextResponse.json(
        { error: process.env.NODE_ENV === "development" ? message : "Upload failed" },
        { status: 500 }
      );
    }
  }
}
