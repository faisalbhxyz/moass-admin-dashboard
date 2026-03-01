import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/api-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".bin";
    const name = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // Vercel: use Blob storage (set BLOB_READ_WRITE_TOKEN in project env)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(name, buffer, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local: write to public/uploads
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, path.basename(name));
    await writeFile(filePath, buffer);
    return NextResponse.json({ url: `/uploads/${path.basename(name)}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] Error:", err);
    if (
      process.env.VERCEL &&
      !process.env.BLOB_READ_WRITE_TOKEN &&
      message.includes("EACCES")
    ) {
      return NextResponse.json(
        {
          error:
            "Image upload not configured. Add Blob storage and set BLOB_READ_WRITE_TOKEN in Vercel.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Upload failed" },
      { status: 500 }
    );
  }
}
