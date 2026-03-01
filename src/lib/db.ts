import path from "path";
import { PrismaClient } from "@prisma/client";

// Resolve relative file: URLs so SQLite works from any cwd (e.g. Next.js .next)
const url = process.env.DATABASE_URL;
if (url?.startsWith("file:./") || url?.startsWith("file:../")) {
  const rel = url.replace(/^file:/, "");
  process.env.DATABASE_URL = "file:" + path.resolve(process.cwd(), rel);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
