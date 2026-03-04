"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        background: "#f9f9f9",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111", marginBottom: 8 }}>
        Something went wrong
      </h1>
      <p style={{ maxWidth: 400, fontSize: 14, color: "#666", marginBottom: 24 }}>
        A server error occurred. This can happen if the database is temporarily unavailable. Try
        again or sign in to continue.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            background: "#fff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Go to login
        </a>
      </div>
    </div>
  );
}
