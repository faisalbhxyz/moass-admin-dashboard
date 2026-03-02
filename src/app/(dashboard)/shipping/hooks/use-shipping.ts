"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type Zone = {
  id: string;
  name: string;
  regions: string;
  price: { toString(): string };
  sortOrder: number;
};

const KEY = ["admin", "shipping"] as const;

async function fetchZones(): Promise<Zone[]> {
  const res = await fetch("/api/admin/shipping");
  if (!res.ok) throw new Error("Failed to fetch shipping zones");
  return res.json();
}

export function useShippingQuery(initial: Zone[]) {
  const q = useQuery({ queryKey: KEY, queryFn: fetchZones, initialData: initial });
  return { ...q, zones: (q.data ?? initial) as Zone[] };
}

export function useCreateZoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; regions: string; price: number }) => {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Create failed");
      return data as Zone;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Zone[]>(KEY);
      const temp: Zone = { id: `temp-${Date.now()}`, name: vars.name, regions: vars.regions, price: vars.price as unknown as { toString(): string }, sortOrder: 999 };
      qc.setQueryData<Zone[]>(KEY, (old) => (old ? [...old, temp] : [temp]));
      return { prev, tempId: temp.id };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to create zone");
    },
    onSuccess: (data, _v, ctx) => {
      if (ctx?.tempId) {
        qc.setQueryData<Zone[]>(KEY, (old) => (old ? old.map((z) => (z.id === ctx.tempId ? data : z)) : [data]));
      }
      toast.success("Zone created");
    },
  });
}

export function useUpdateZoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, regions, price }: { id: string; name: string; regions: string; price: number }) => {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, regions, price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Update failed");
      return data as Zone;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Zone[]>(KEY);
      qc.setQueryData<Zone[]>(KEY, (old) =>
        old ? old.map((z) => (z.id === vars.id ? { ...z, name: vars.name, regions: vars.regions, price: vars.price as unknown as { toString(): string } } : z)) : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to update zone");
    },
    onSuccess: (data) => {
      qc.setQueryData<Zone[]>(KEY, (old) => (old ? old.map((z) => (z.id === data.id ? data : z)) : [data]));
      toast.success("Zone updated");
    },
  });
}

export function useDeleteZoneMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Delete failed");
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Zone[]>(KEY);
      qc.setQueryData<Zone[]>(KEY, (old) => (old ? old.filter((z) => z.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to delete zone");
    },
    onSuccess: () => toast.success("Zone deleted"),
  });
}
