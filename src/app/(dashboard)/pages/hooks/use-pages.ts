"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  active: boolean;
  updatedAt: Date;
};

const KEY = ["admin", "pages"] as const;

async function fetchPages(): Promise<PageRow[]> {
  const res = await fetch("/api/admin/pages");
  if (!res.ok) throw new Error("Failed to fetch pages");
  return res.json();
}

export function usePagesQuery(initial: PageRow[]) {
  const q = useQuery({ queryKey: KEY, queryFn: fetchPages, initialData: initial });
  return { ...q, pages: (q.data ?? initial) as PageRow[] };
}

export function useDeletePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Delete failed");
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<PageRow[]>(KEY);
      qc.setQueryData<PageRow[]>(KEY, (old) => (old ? old.filter((p) => p.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to delete page");
    },
    onSuccess: () => toast.success("Page deleted"),
  });
}

export function useTogglePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Toggle failed");
      return data as PageRow;
    },
    onMutate: async ({ id, active }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<PageRow[]>(KEY);
      qc.setQueryData<PageRow[]>(KEY, (old) =>
        old ? old.map((p) => (p.id === id ? { ...p, active: !active } : p)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to toggle page");
    },
    onSuccess: (data) => {
      qc.setQueryData<PageRow[]>(KEY, (old) => (old ? old.map((p) => (p.id === data.id ? data : p)) : [data]));
    },
  });
}

export function useSavePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id?: string; slug: string; title: string; content: string; sortOrder: number }) => {
      if (vars.id) {
        const res = await fetch(`/api/admin/pages/${vars.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: vars.slug, title: vars.title, content: vars.content, sortOrder: vars.sortOrder }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Update failed");
        return data as PageRow;
      }
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: vars.slug,
          title: vars.title,
          content: vars.content,
          sortOrder: vars.sortOrder,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof (data as { error?: unknown }).error === "object" ? "Invalid data" : (data as { error?: string }).error ?? "Create failed");
      return data as PageRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Page saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
