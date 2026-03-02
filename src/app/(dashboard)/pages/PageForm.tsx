"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type ContentPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  sortOrder: number;
};

type Props = {
  initial?: ContentPage | null;
};

const defaultHtml = `<h1>Page title</h1>
<p>Write your content here. You can use <strong>bold</strong>, <em>italic</em>, lists, and links.</p>
<ul>
  <li>Point one</li>
  <li>Point two</li>
</ul>
<p>This HTML will be shown exactly the same on the storefront.</p>`;

export function PageForm({ initial }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? defaultHtml);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initial;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSaving(true);
      try {
        if (isEdit) {
          const res = await fetch(`/api/admin/pages/${initial.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: slug.trim(), title: title.trim(), content, sortOrder }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || "Update failed");
            return;
          }
          router.refresh();
          router.push("/pages");
          return;
        }
        const res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.trim(),
            title: title.trim(),
            content: content || defaultHtml,
            sortOrder,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "object" ? JSON.stringify(data.error) : data.error || "Create failed");
          return;
        }
        router.refresh();
        router.push("/pages");
      } finally {
        setSaving(false);
      }
    },
    [isEdit, initial?.id, slug, title, content, sortOrder, router]
  );

  const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";
  const labelClass = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="text-sm font-medium text-gray-900">
            {isEdit ? "Edit page" : "New page"}
          </div>
        </div>
        <div className="space-y-4 px-6 py-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Privacy Policy"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Slug (URL-friendly, lowercase, hyphens only)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="e.g. privacy-policy"
                className={inputClass}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Storefront URL: <code className="rounded bg-gray-100 px-1">/api/ecommerce/pages/{slug || "slug"}</code>
              </p>
            </div>
          </div>
          <div>
            <label className={labelClass}>Sort order (lower = first)</label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="h-9 w-24 rounded-md border border-gray-300 bg-white px-3 text-sm"
            />
          </div>
          <div>
            <label className={labelClass}>Content (HTML)</label>
            <p className="mb-2 text-xs text-gray-500">
              Use HTML tags (e.g. &lt;h1&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;). The same HTML is sent to the storefront and will be rendered with the same design.
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full rounded-md border border-gray-300 bg-gray-50 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="<p>Your content...</p>"
              spellCheck={false}
            />
          </div>
          <div>
            <span className={labelClass}>Live preview (as storefront will show)</span>
            <div
              className="mt-1 min-h-[120px] rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400'>Nothing to preview.</p>" }}
            />
          </div>
        </div>
        <div className="flex gap-2 border-t border-gray-200 px-6 py-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
          <Link href="/pages">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </form>
  );
}
