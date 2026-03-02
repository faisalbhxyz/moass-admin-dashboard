"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type MenuItemJson = {
  id: string;
  menuGroupId: string;
  label: string;
  link: string;
  sortOrder: number;
};

export type MenuGroupJson = {
  id: string;
  key: string;
  label: string;
  placement: string;
  sortOrder: number;
  items?: MenuItemJson[];
};

const KEY = ["admin", "menu-groups"] as const;

async function fetchGroups(): Promise<MenuGroupJson[]> {
  const res = await fetch("/api/admin/menu-groups");
  if (!res.ok) throw new Error("Failed to fetch menus");
  return res.json();
}

export function useMenuGroupsQuery(initial: MenuGroupJson[]) {
  const q = useQuery({ queryKey: KEY, queryFn: fetchGroups, initialData: initial });
  return { ...q, groups: (q.data ?? initial) as MenuGroupJson[] };
}

export function useCreateMenuGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { key: string; label: string; placement: string; sortOrder: number }) => {
      const res = await fetch("/api/admin/menu-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to create group");
      return data as MenuGroupJson;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      const temp: MenuGroupJson = { id: `temp-${Date.now()}`, key: vars.key, label: vars.label, placement: vars.placement, sortOrder: vars.sortOrder, items: [] };
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) => (old ? [...old, temp] : [temp]));
      return { prev, tempId: temp.id };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to create group"); },
    onSuccess: (data, _v, ctx) => {
      if (ctx?.tempId) qc.setQueryData<MenuGroupJson[]>(KEY, (old) => (old ? old.map((g) => (g.id === ctx.tempId ? data : g)) : [data]));
    },
  });
}

export function useUpdateMenuGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, key, label, placement }: { id: string; key: string; label: string; placement: string }) => {
      const res = await fetch(`/api/admin/menu-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, label, placement }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to update group");
      return data as MenuGroupJson;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
        old ? old.map((g) => (g.id === vars.id ? { ...g, key: vars.key, label: vars.label, placement: vars.placement } : g)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to update group"); },
    onSuccess: (data) => {
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) => (old ? old.map((g) => (g.id === data.id ? { ...data, items: g.items ?? [] } : g)) : [data]));
    },
  });
}

export function useDeleteMenuGroupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu-groups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete group");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) => (old ? old.filter((g) => g.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to delete group"); },
  });
}

export function useCreateMenuItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { menuGroupId: string; label: string; link: string; sortOrder: number }) => {
      const res = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to add item");
      return data as MenuItemJson;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      const temp: MenuItemJson = { id: `temp-${Date.now()}`, menuGroupId: vars.menuGroupId, label: vars.label, link: vars.link, sortOrder: vars.sortOrder };
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
        old ? old.map((g) => (g.id === vars.menuGroupId ? { ...g, items: [...(g.items ?? []), temp] } : g)) : old
      );
      return { prev, tempId: temp.id, menuGroupId: vars.menuGroupId };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to add item"); },
    onSuccess: (data, _v, ctx) => {
      if (ctx?.tempId && ctx?.menuGroupId) {
        qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
          old ? old.map((g) => (g.id === ctx.menuGroupId ? { ...g, items: (g.items ?? []).map((i) => (i.id === ctx.tempId ? data : i)) } : g)) : old
        );
      }
    },
  });
}

export function useUpdateMenuItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, label, link }: { id: string; label: string; link: string }) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, link }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to update item");
      return data as MenuItemJson;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
        old
          ? old.map((g) => ({
              ...g,
              items: (g.items ?? []).map((i) => (i.id === vars.id ? { ...i, label: vars.label, link: vars.link } : i)),
            }))
          : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to update item"); },
    onSuccess: (data) => {
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
        old ? old.map((g) => (g.id === data.menuGroupId ? { ...g, items: (g.items ?? []).map((i) => (i.id === data.id ? data : i)) } : g)) : old
      );
    },
  });
}

export function useDeleteMenuItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<MenuGroupJson[]>(KEY);
      qc.setQueryData<MenuGroupJson[]>(KEY, (old) =>
        old ? old.map((g) => ({ ...g, items: (g.items ?? []).filter((i) => i.id !== id) })) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error("Failed to delete item"); },
  });
}
