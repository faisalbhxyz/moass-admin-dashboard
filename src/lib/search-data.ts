import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/** Top 9 trending search queries from last 7 days. Cached 10 minutes. */
export const getTrendingSearches = unstable_cache(
  async () => {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const rows = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 9,
    });

    return rows.map((r) => r.query);
  },
  ["search-trending"],
  { revalidate: 60 * 10 }
);
