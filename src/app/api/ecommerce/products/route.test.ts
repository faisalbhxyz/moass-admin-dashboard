/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/db");

function createRequest(url: string = "http://localhost/api/ecommerce/products") {
  return new NextRequest(url);
}

describe("GET /api/ecommerce/products", () => {
  beforeEach(() => {
    vi.mocked(prisma.product.findMany).mockReset();
    vi.mocked(prisma.product.count).mockReset();
  });

  it("returns paginated products with default page and limit", async () => {
    const mockProducts = [
      {
        id: "p1",
        name: "Test Product",
        slug: "test-product",
        categories: [],
      },
    ];
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);
    vi.mocked(prisma.product.count).mockResolvedValue(1);

    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toEqual(mockProducts);
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true },
        skip: 0,
        take: 20,
      })
    );
  });

  it("applies page and limit query params", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost/api/ecommerce/products?page=2&limit=10"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it("filters by categoryId when provided", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost/api/ecommerce/products?categoryId=cat123"
    );
    await GET(request);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          categories: { some: { id: "cat123" } },
        }),
      })
    );
  });

  it("filters by search when provided", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost/api/ecommerce/products?search=laptop"
    );
    await GET(request);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          OR: [
            { name: { contains: "laptop" } },
            { description: { contains: "laptop" } },
          ],
        }),
      })
    );
  });

  it("caps limit at 50", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost/api/ecommerce/products?limit=100"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.limit).toBe(50);
  });
});
