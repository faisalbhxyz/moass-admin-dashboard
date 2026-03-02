import path from "path";
import type { NextConfig } from "next";

// CORS is handled in src/proxy.ts so that both production storefront
// (STOREFRONT_ORIGIN) and localhost (3000, 3001) are allowed.
const nextConfig: NextConfig = {
  // Use project root so Vercel/build doesn't pick up parent lockfiles
  turbopack: { root: path.join(__dirname) },
  // Keep serverless bundles smaller so "Deploying outputs" succeeds on Vercel
  outputFileTracingExcludes: {
    "*": [
      "./docs/**",
      "./scripts/**",
      "./prisma/migrations/**",
      "./.git/**",
      "./*.md",
    ],
  },
};

export default nextConfig;
