"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type Coupon = {
  id: string;
  code: string;
  type: string;
  value: { toString(): string };
  minOrder: { toString(): string } | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

const KEY = ["admin", "coupons"] as const;

async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch("/api/admin/coupons");
  if (!res.ok) throw new Error("Failed to fetch coupons");
  return res.json();
}

export function useCouponsQuery(initial: Coupon[]) {
  const q = useQuery({ queryKey: KEY, queryFn: fetchCoupons, initialData: initial });
  return { ...q, coupons: (q.data ?? initial) as Coupon[] };
}

export function useCreateCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { code: string; type: "percent" | "fixed"; value: number; minOrder: number | null; maxUses: number | null; startsAt: string | null; endsAt: string | null; active: boolean }) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Create failed");
      return data as Coupon;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Coupon[]>(KEY);
      const temp: Coupon = {
        id: `temp-${Date.now()}`,
        code: vars.code,
        type: vars.type,
        value: vars.value as unknown as { toString(): string },
        minOrder: vars.minOrder as unknown as { toString(): string } | null,
        maxUses: vars.maxUses,
        usedCount: 0,
        active: vars.active,
        startsAt: vars.startsAt ? new Date(vars.startsAt) : null,
        endsAt: vars.endsAt ? new Date(vars.endsAt) : null,
      };
      qc.setQueryData<Coupon[]>(KEY, (old) => (old ? [temp, ...old] : [temp]));
      return { prev, tempId: temp.id };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to create coupon");
    },
    onSuccess: (data, _v, ctx) => {
      if (ctx?.tempId) {
        qc.setQueryData<Coupon[]>(KEY, (old) => (old ? old.map((c) => (c.id === ctx.tempId ? data : c)) : [data]));
      }
      toast.success("Coupon created");
    },
  });
}

export function useUpdateCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      code,
      type,
      value,
      minOrder,
      maxUses,
      startsAt,
      endsAt,
      active,
    }: {
      id: string;
      code: string;
      type: "percent" | "fixed";
      value: number;
      minOrder: number | null;
      maxUses: number | null;
      startsAt?: string | null;
      endsAt?: string | null;
      active: boolean;
    }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value, minOrder, maxUses, startsAt, endsAt, active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Update failed");
      return data as Coupon;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Coupon[]>(KEY);
      qc.setQueryData<Coupon[]>(KEY, (old) =>
        old
          ? old.map((c) =>
              c.id === vars.id
                ? {
                    ...c,
                    code: vars.code,
                    type: vars.type,
                    value: vars.value as unknown as { toString(): string },
                    minOrder: vars.minOrder as unknown as { toString(): string } | null,
                    maxUses: vars.maxUses,
                    startsAt: vars.startsAt ? new Date(vars.startsAt) : null,
                    endsAt: vars.endsAt ? new Date(vars.endsAt) : null,
                    active: vars.active,
                  }
                : c
            )
          : old
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to update coupon");
    },
    onSuccess: (data) => {
      qc.setQueryData<Coupon[]>(KEY, (old) => (old ? old.map((c) => (c.id === data.id ? data : c)) : [data]));
      toast.success("Coupon updated");
    },
  });
}

export function useDeleteCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Delete failed");
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Coupon[]>(KEY);
      qc.setQueryData<Coupon[]>(KEY, (old) => (old ? old.filter((c) => c.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Failed to delete coupon");
    },
    onSuccess: () => toast.success("Coupon deleted"),
  });
}
