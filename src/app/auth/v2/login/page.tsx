import { redirect } from "next/navigation";

/** Redirect /auth/v2/login to / (root). Kept for backward compatibility. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const from = params.from || "/";
  const target = from && !from.startsWith("/auth/") ? from : "/";
  const url = target === "/" ? "/" : `/?from=${encodeURIComponent(target)}`;
  const withError = params.error ? `${url}${url.includes("?") ? "&" : "?"}error=${params.error}` : url;
  redirect(withError);
}
