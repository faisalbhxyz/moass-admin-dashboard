"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export type PaymentMethodRow = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  accountNumber: string | null;
  instructions: string | null;
  logoUrl: string | null;
  sortOrder: number;
};

const KEY = ["admin", "payment-methods"] as const;

async function fetchMethods(): Promise<PaymentMethodRow[]> {
  const res = await fetch("/api/admin/payment-methods");
  if (!res.ok) throw new Error("Failed to fetch payment methods");
  return res.json();
}

export function usePaymentMethodsQuery(initial: PaymentMethodRow[]) {
  const q = useQuery({ queryKey: KEY, queryFn: fetchMethods, initialData: initial });
  return { ...q, methods: (q.data ?? initial) as PaymentMethodRow[] };
}

type SaveBody = {
  name: string;
  type: "COD" | "MANUAL";
  accountNumber: string | null;
  instructions: string | null;
  logoUrl: string | null;
  sortOrder: number;
};

export function useSavePaymentMethodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id?: string } & SaveBody) => {
      if (id) {
        const res = await fetch(`/api/admin/payment-methods/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Update failed");
        return res.json() as Promise<PaymentMethodRow>;
      }
      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Create failed");
      return res.json() as Promise<PaymentMethodRow>;
    },
    onMutate: async ({ id, ...vars }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<PaymentMethodRow[]>(KEY);
      if (id) {
        qc.setQueryData<PaymentMethodRow[]>(KEY, (old) =>
          old ? old.map((p) => (p.id === id ? { ...p, ...vars } : p)) : old
        );
      } else {
        const temp: PaymentMethodRow = {
          id: `temp-${Date.now()}`,
          name: vars.name,
          type: vars.type,
          isActive: true,
          accountNumber: vars.accountNumber,
          instructions: vars.instructions,
          logoUrl: vars.logoUrl,
          sortOrder: vars.sortOrder,
        };
        qc.setQueryData<PaymentMethodRow[]>(KEY, (old) => (old ? [...old, temp].sort((a, b) => a.sortOrder - b.sortOrder) : [temp]));
        return { prev, tempId: temp.id };
      }
      return { prev };
    },
    onError: (_e, v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error(v.id ? "Update failed" : "Create failed");
    },
    onSuccess: (data, vars, ctx) => {
      if (!vars.id && ctx && "tempId" in ctx) {
        qc.setQueryData<PaymentMethodRow[]>(KEY, (old) =>
          old ? old.map((p) => (p.id === (ctx as { tempId: string }).tempId ? data : p)).sort((a, b) => a.sortOrder - b.sortOrder) : [data]
        );
      } else if (vars.id) {
        qc.setQueryData<PaymentMethodRow[]>(KEY, (old) => (old ? old.map((p) => (p.id === data.id ? data : p)) : [data]));
      }
      toast.success(vars.id ? "Updated" : "Created");
    },
  });
}

export function useTogglePaymentMethodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/payment-methods/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("Toggle failed");
      return res.json() as Promise<PaymentMethodRow>;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<PaymentMethodRow[]>(KEY);
      qc.setQueryData<PaymentMethodRow[]>(KEY, (old) =>
        old ? old.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)) : old
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Toggle failed");
    },
    onSuccess: (data) => {
      qc.setQueryData<PaymentMethodRow[]>(KEY, (old) => (old ? old.map((p) => (p.id === data.id ? data : p)) : [data]));
    },
  });
}

export function useDeletePaymentMethodMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<PaymentMethodRow[]>(KEY);
      qc.setQueryData<PaymentMethodRow[]>(KEY, (old) => (old ? old.filter((p) => p.id !== id) : old));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
      toast.error("Delete failed");
    },
    onSuccess: () => toast.success("Deleted"),
  });
}
