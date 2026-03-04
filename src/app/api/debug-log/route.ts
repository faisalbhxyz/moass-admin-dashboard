import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), ".cursor", "debug-cfd45d.log");

/**
 * Debug log – dev only. Disabled in production to prevent abuse.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = await req.json();
    const line = JSON.stringify(body) + "\n";
    const dir = path.dirname(LOG_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(LOG_PATH, line, { flag: "a" });
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
