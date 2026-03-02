"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Type, Code } from "lucide-react";
import { useSavePageMutation } from "./hooks/use-pages";

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

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const defaultHtml = `<h1>Page title</h1>
<p>Write your content here. You can use <strong>bold</strong>, <em>italic</em>, lists, and links.</p>
<ul>
  <li>Point one</li>
  <li>Point two</li>
</ul>
<p>This HTML will be shown exactly the same on the storefront.</p>`;

export function PageForm({ initial }: Props) {
  const router = useRouter();
  const savePage = useSavePageMutation();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? defaultHtml);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [contentTab, setContentTab] = useState<"rich" | "html">("rich");
  const [error, setError] = useState<string | null>(null);
  const saving = savePage.isPending;
  const richEditorRef = useRef<HTMLDivElement>(null);
  const prevTitleRef = useRef<string>(initial?.title ?? "");

  const isEdit = !!initial;

  // Auto slug from title when title changes; if user edited slug (slug !== slugify(prevTitle)), keep their slug
  useEffect(() => {
    if (!title.trim()) return;
    const prevSlugFromTitle = slugify(prevTitleRef.current);
    if (slug === prevSlugFromTitle || (prevTitleRef.current === "" && !slug)) {
      setSlug(slugify(title));
    }
    prevTitleRef.current = title;
  }, [title]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSlug(v);
  };

  const prevContentTabRef = useRef<"rich" | "html">(contentTab);
  // Sync rich editor only when switching to rich tab (so HTML tab content appears in editor)
  useEffect(() => {
    if (contentTab === "rich" && prevContentTabRef.current !== "rich" && richEditorRef.current) {
      richEditorRef.current.innerHTML = content || "<p><br></p>";
    }
    prevContentTabRef.current = contentTab;
  }, [contentTab, content]);

  const handleRichInput = useCallback(() => {
    if (!richEditorRef.current) return;
    setContent(richEditorRef.current.innerHTML || "");
  }, []);

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    richEditorRef.current?.focus();
    handleRichInput();
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      savePage.mutate(
        {
          id: initial?.id,
          slug: slug.trim(),
          title: title.trim(),
          content: content || defaultHtml,
          sortOrder,
        },
        {
          onSuccess: () => router.push("/pages"),
          onError: (err) => setError(err.message),
        }
      );
    },
    [initial?.id, slug, title, content, sortOrder, savePage, router]
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
              <p className="mt-1 text-xs text-gray-500">Slug will be auto-generated from title; you can edit it below.</p>
            </div>
            <div>
              <label className={labelClass}>
                Slug (URL-friendly, editable)
              </label>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g. privacy-policy"
                className={inputClass}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Storefront: <code className="rounded bg-gray-100 px-1">/api/ecommerce/pages/{slug || "slug"}</code>
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

          {/* Content: Rich text | HTML tabs */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className={labelClass}>Content</label>
              <div className="ml-auto flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setContentTab("rich")}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium ${
                    contentTab === "rich" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Type className="h-3.5 w-3.5" />
                  Rich text
                </button>
                <button
                  type="button"
                  onClick={() => setContentTab("html")}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium ${
                    contentTab === "html" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  HTML
                </button>
              </div>
            </div>

            {contentTab === "rich" ? (
              <div className="rounded-md border border-gray-300 bg-white">
                <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
                  <button type="button" onClick={() => execCommand("bold")} className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200" title="Bold">B</button>
                  <button type="button" onClick={() => execCommand("italic")} className="rounded px-2 py-1 text-sm italic hover:bg-gray-200" title="Italic">I</button>
                  <button type="button" onClick={() => execCommand("underline")} className="rounded px-2 py-1 text-sm underline hover:bg-gray-200" title="Underline">U</button>
                  <span className="mx-1 w-px bg-gray-300" />
                  <button type="button" onClick={() => execCommand("insertUnorderedList")} className="rounded px-2 py-1 hover:bg-gray-200" title="Bullet list">• List</button>
                  <button type="button" onClick={() => execCommand("insertOrderedList")} className="rounded px-2 py-1 hover:bg-gray-200" title="Numbered list">1. List</button>
                  <span className="mx-1 w-px bg-gray-300" />
                  <button type="button" onClick={() => execCommand("createLink", prompt("Link URL:") || undefined)} className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-gray-200" title="Link">Link</button>
                </div>
                <div
                  ref={richEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleRichInput}
                  className="min-h-[200px] max-h-[400px] overflow-y-auto px-3 py-3 text-sm text-gray-900 focus:outline-none prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full rounded-md border border-gray-300 bg-gray-50 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="<p>Your HTML...</p>"
                  spellCheck={false}
                />
                <p className="text-xs text-gray-500">Preview (same as storefront):</p>
                <div
                  className="min-h-[120px] rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-400'>Nothing to preview.</p>" }}
                />
              </div>
            )}
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
