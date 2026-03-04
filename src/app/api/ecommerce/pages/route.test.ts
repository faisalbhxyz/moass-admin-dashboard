/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/db", () => ({
  prisma: {
    contentPage: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/db");

describe("GET /api/ecommerce/pages", () => {
  beforeEach(() => {
    vi.mocked(prisma.contentPage.findMany).mockReset();
  });

  it("returns active pages with slug and title", async () => {
    const mockPages = [
      { id: "1", slug: "terms", title: "Terms & Conditions" },
      { id: "2", slug: "policy", title: "Privacy Policy" },
    ];
    vi.mocked(prisma.contentPage.findMany).mockResolvedValue(mockPages);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPages);
    expect(prisma.contentPage.findMany).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, slug: true, title: true },
    });
  });

  it("returns empty array when no pages exist", async () => {
    vi.mocked(prisma.contentPage.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
