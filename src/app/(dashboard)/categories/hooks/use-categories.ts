"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { name: string } | null;
  image: string | null;
  _count: { products: number };
};

const KEY = ["admin", "categories"] as const;

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export function useCategoriesQuery(initial: Category[]) {
  const q = useQuery({
    queryKey: KEY,
    queryFn: fetchCategories,
    initialData: initial,
  });
  return { ...q, categories: (q.data ?? initial) as Category[] };
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      slug,
      parentId,
      image,
    }: {
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
      image: string | null;
    }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, parentId, image }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Update failed");
      return data as Category;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Category[]>(KEY);
      const parentCat = prev?.find((p) => p.id === vars.parentId);
      qc.setQueryData<Category[]>(KEY, (old) =>
        old
          ? old.map((c) =>
              c.id === vars.id
                ? { ...c, name: vars.name, slug: vars.slug, parentId: vars.parentId, image: vars.image, parent: parentCat ? { name: parentCat.name } : null }
                : c
            )
          : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to update category");
    },
    onSuccess: (data, vars, ctx) => {
      qc.setQueryData<Category[]>(KEY, (old) => {
        if (!old) return [data];
        const existing = old.find((c) => c.id === data.id);
        return old.map((c) => (c.id === data.id ? { ...data, _count: existing?._count ?? { products: 0 } } : c));
      });
      toast.success("Category updated");
    },
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug: string; parentId: string | null; image: string | null }) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Create failed");
      return data as Category;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Category[]>(KEY);
      const temp: Category = {
        id: `temp-${Date.now()}`,
        name: vars.name,
        slug: vars.slug,
        parentId: vars.parentId,
        parent: null,
        image: vars.image,
        _count: { products: 0 },
      };
      qc.setQueryData<Category[]>(KEY, (old) => (old ? [...old, temp] : [temp]));
      return { prev, tempId: temp.id };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to create category");
    },
    onSuccess: (data, _v, ctx) => {
      if (ctx?.tempId) {
        qc.setQueryData<Category[]>(KEY, (old) =>
          old ? old.map((c) => (c.id === ctx.tempId ? data : c)) : [data]
        );
      }
      toast.success("Category created");
    },
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Delete failed");
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Category[]>(KEY);
      qc.setQueryData<Category[]>(KEY, (old) => (old ? old.filter((c) => c.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to delete category");
    },
    onSuccess: () => toast.success("Category deleted"),
  });
}
