import { NextResponse } from "next/server";
import { getTrendingSearches } from "@/lib/search-data";

/** GET /api/search/trending – top 9 trending queries (last 7 days). Cached 10 min. */
export async function GET() {
  try {
    const queries = await getTrendingSearches();
    return NextResponse.json({ trending: queries });
  } catch (e) {
    console.error("[search/trending]", e);
    return NextResponse.json(
      { error: "Failed to load trending searches" },
      { status: 500 }
    );
  }
}
