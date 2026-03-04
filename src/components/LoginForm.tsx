"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function LoginForm() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("/");
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get("from") || pathname || "/");
    setSessionError(params.get("error") === "session");
  }, [pathname]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const targetParam = params.get("from") || pathname || "/";
      const target =
        targetParam && !targetParam.startsWith("/auth/") ? targetParam : "/";
      window.location.replace(
        target.startsWith("/") ? window.location.origin + target : target
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F9F9",
        padding: 16,
      }}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6"
        style={{
          maxWidth: 384,
          width: "100%",
          borderRadius: 8,
          border: "1px solid #E5E7EB",
          background: "#fff",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
          Login
        </h1>
        <p style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>
          MOASS Admin Dashboard
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4"
          style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}
        >
          {sessionError && (
            <p
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
              style={{
                borderRadius: 6,
                border: "1px solid #FDE68A",
                background: "#FFFBEB",
                padding: "8px 12px",
                fontSize: 12,
                color: "#92400E",
              }}
            >
              Session expired or server error. Please sign in again.
            </p>
          )}
          {error && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
              style={{
                borderRadius: 6,
                border: "1px solid #FECACA",
                background: "#FEF2F2",
                padding: "8px 12px",
                fontSize: 12,
                color: "#DC2626",
              }}
            >
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium text-gray-700"
              style={{
                marginBottom: 4,
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#374151",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              style={{
                height: 36,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                padding: "0 12px",
                fontSize: 14,
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-gray-700"
              style={{
                marginBottom: 4,
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              style={{
                height: 36,
                width: "100%",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                padding: "0 12px",
                fontSize: 14,
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-700 disabled:opacity-50"
            style={{
              width: "100%",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 14,
              fontWeight: 500,
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
