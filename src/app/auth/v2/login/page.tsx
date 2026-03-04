"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginFormInner({ from }: { from: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      // Full-page redirect so dashboard loads directly without client-side Loading state
      window.location.href = from;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-sm font-medium tracking-tight text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-500">MOASS Admin Dashboard</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  return <LoginFormInner from={from} />;
}

export default function LoginPage() {
  // Fallback shows form immediately so user never sees "Loading..."
  return (
    <Suspense fallback={<LoginFormInner from="/" />}>
      <LoginForm />
    </Suspense>
  );
}
