/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn().mockResolvedValue(undefined),
}));

const { prisma } = await import("@/lib/db");
const { verifyPassword } = await import("@/lib/auth");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    vi.mocked(verifyPassword).mockReset();
  });

  it("returns 400 for invalid email", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid", password: "pass123" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 for wrong password", async () => {
    const mockUser = {
      id: "u1",
      email: "admin@test.com",
      password: "hashed",
      name: "Admin",
      role: "admin",
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "wrongpass" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.2" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("returns 401 when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@test.com", password: "pass" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.3" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid email or password");
  });

  it("returns user on successful login", async () => {
    const mockUser = {
      id: "u1",
      email: "admin@test.com",
      password: "hashed",
      name: "Admin",
      role: "admin",
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "correct" }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.4" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    });
  });
});
