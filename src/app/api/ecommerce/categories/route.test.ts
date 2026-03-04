/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/ecommerce-public-data", () => ({
  getCachedCategories: vi.fn(),
}));

const { getCachedCategories } = await import("@/lib/ecommerce-public-data");

describe("GET /api/ecommerce/categories", () => {
  beforeEach(() => {
    vi.mocked(getCachedCategories).mockReset();
  });

  it("returns categories with parent, children and product count", async () => {
    const mockCategories = [
      {
        id: "cat1",
        name: "Electronics",
        slug: "electronics",
        parent: null,
        children: [],
        _count: { products: 5 },
      },
    ];
    vi.mocked(getCachedCategories).mockResolvedValue(mockCategories);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCategories);
    expect(getCachedCategories).toHaveBeenCalled();
  });

  it("returns empty array when no categories exist", async () => {
    vi.mocked(getCachedCategories).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
