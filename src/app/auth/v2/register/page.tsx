"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
  const labelClass = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-sm font-medium tracking-tight text-gray-900">Register</h1>
        <p className="mt-1 text-sm text-gray-500">Create admin account</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="name" className={labelClass}>Name (optional)</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password (min 6)</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/v2/login" className="font-medium text-gray-900 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
