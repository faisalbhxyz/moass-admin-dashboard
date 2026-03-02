"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export type Banner = {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  sortOrder: number;
  active: boolean;
};

const BANNERS_KEY = ["banners"] as const;

async function fetchBanners(): Promise<Banner[]> {
  const res = await fetch("/api/admin/banners");
  if (!res.ok) throw new Error("Failed to fetch banners");
  return res.json();
}

/** Use with initialBanners from server so first paint is instant; list updates optimistically on add/edit/delete. */
export function useBannersQuery(initialBanners: Banner[]) {
  const q = useQuery({
    queryKey: BANNERS_KEY,
    queryFn: fetchBanners,
    initialData: initialBanners,
  });
  const banners = (q.data ?? initialBanners) as Banner[];
  return { ...q, banners };
}

type CreateVars = { title?: string | null; image: string; link?: string | null };
type UpdateVars = { id: string; title?: string | null; image: string; link?: string | null };

export function useCreateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: CreateVars) => {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vars.title ?? undefined,
          image: vars.image,
          link: vars.link ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to create");
      return data as Banner;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: BANNERS_KEY });
      const previous = qc.getQueryData<Banner[]>(BANNERS_KEY);
      const tempId = `temp-${Date.now()}`;
      const optimistic: Banner = {
        id: tempId,
        title: vars.title ?? null,
        image: vars.image,
        link: vars.link ?? null,
        sortOrder: 999,
        active: true,
      };
      qc.setQueryData<Banner[]>(BANNERS_KEY, (old) => (old ? [...old, optimistic] : [optimistic]));
      return { previous, tempId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        qc.setQueryData(BANNERS_KEY, context.previous);
      }
      toast.error("Failed to add banner");
    },
    onSuccess: (serverBanner, _vars, context) => {
      if (context?.tempId) {
        qc.setQueryData<Banner[]>(BANNERS_KEY, (old) =>
          old ? old.map((b) => (b.id === context.tempId ? serverBanner : b)) : [serverBanner]
        );
      }
      toast.success("Banner added");
    },
  });
}

export function useUpdateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...vars }: UpdateVars) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: vars.title ?? undefined,
          image: vars.image,
          link: vars.link ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to update");
      return data as Banner;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: BANNERS_KEY });
      const previous = qc.getQueryData<Banner[]>(BANNERS_KEY);
      qc.setQueryData<Banner[]>(BANNERS_KEY, (old) =>
        old
          ? old.map((b) =>
              b.id === vars.id
                ? {
                    ...b,
                    title: vars.title ?? b.title,
                    image: vars.image,
                    link: vars.link ?? b.link,
                  }
                : b
            )
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        qc.setQueryData(BANNERS_KEY, context.previous);
      }
      toast.error("Failed to update banner");
    },
    onSuccess: () => {
      toast.success("Banner updated");
    },
  });
}

export function useDeleteBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to delete");
      }
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: BANNERS_KEY });
      const previous = qc.getQueryData<Banner[]>(BANNERS_KEY);
      qc.setQueryData<Banner[]>(BANNERS_KEY, (old) => (old ? old.filter((b) => b.id !== id) : old));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous != null) {
        qc.setQueryData(BANNERS_KEY, context.previous);
      }
      toast.error("Failed to delete banner");
    },
    onSuccess: () => {
      toast.success("Banner deleted");
    },
  });
}
