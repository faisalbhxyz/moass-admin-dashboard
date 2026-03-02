"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Section, SectionConfig, ResolvedSectionResponse } from "@/types/homepage-sections";

const API = "/api/admin/homepage-sections";

async function fetchSections(): Promise<{ sections: Section[] }> {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Failed to fetch sections");
  return res.json();
}

async function fetchSection(key: string): Promise<ResolvedSectionResponse> {
  const res = await fetch(`${API}/${key}`);
  if (!res.ok) throw new Error("Failed to fetch section");
  return res.json();
}

async function updateSettings(
  key: string,
  data: Partial<SectionConfig>
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to save");
  }
  return res.json();
}

async function pinProduct(
  key: string,
  productId: string
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}/pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to pin");
  return res.json();
}

async function unpinProduct(
  key: string,
  productId: string
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}/pin?productId=${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unpin");
  return res.json();
}

async function reorderPins(
  key: string,
  productIds: string[]
): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}/pin/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) throw new Error("Failed to reorder");
  return res.json();
}

async function createSection(body: { key: string; title?: string }): Promise<{ section: Section }> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create");
  }
  return res.json();
}

async function updateSectionTitle(key: string, title: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

async function deleteSection(key: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API}/${key}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export function useSectionsQuery() {
  return useQuery({
    queryKey: ["homepage-sections"],
    queryFn: fetchSections,
  });
}

export function useSectionQuery(key: string | null) {
  return useQuery({
    queryKey: ["homepage-section", key],
    queryFn: () => fetchSection(key!),
    enabled: !!key,
  });
}

export function useUpdateSettingsMutation(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SectionConfig>) => updateSettings(key, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-section", key] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePinProductMutation(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => pinProduct(key, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-section", key] });
      toast.success("Product pinned");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUnpinProductMutation(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => unpinProduct(key, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-section", key] });
      toast.success("Product unpinned");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReorderPinsMutation(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productIds: string[]) => reorderPins(key, productIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-section", key] });
      toast.success("Order updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateSectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSection,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["homepage-sections"] });
      const previous = qc.getQueryData<{ sections: Section[] }>(["homepage-sections"]);
      const optimistic: Section = {
        id: `temp-${Date.now()}`,
        key: vars.key,
        title: vars.title,
        mode: "auto",
        is_active: true,
        pinned_count: 0,
        max_items: 10,
        config: { mode: "auto", max_items: 10, auto_days: 7, auto_category: null, is_active: true, pinned_product_ids: [] },
      };
      qc.setQueryData<{ sections: Section[] }>(["homepage-sections"], (old) => ({
        sections: old ? [...old.sections, optimistic] : [optimistic],
      }));
      return { previous };
    },
    onError: (e: Error, _vars, context) => {
      if (context?.previous) qc.setQueryData(["homepage-sections"], context.previous);
      toast.error(e.message);
    },
    onSuccess: (data) => {
      const serverSection = data.section as Section;
      qc.setQueryData<{ sections: Section[] }>(["homepage-sections"], (old) => {
        if (!old) return { sections: [serverSection] };
        const idx = old.sections.findIndex((s) => s.id.startsWith("temp-"));
        if (idx === -1) return { ...old, sections: [...old.sections, serverSection] };
        const next = [...old.sections];
        next[idx] = serverSection;
        return { sections: next };
      });
      toast.success("Section added");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
    },
  });
}

export function useUpdateSectionTitleMutation(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => updateSectionTitle(key, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["homepage-section", key] });
      toast.success("Section updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSection,
    onMutate: async (key) => {
      await qc.cancelQueries({ queryKey: ["homepage-sections"] });
      const previous = qc.getQueryData<{ sections: Section[] }>(["homepage-sections"]);
      qc.setQueryData<{ sections: Section[] }>(["homepage-sections"], (old) =>
        old ? { sections: old.sections.filter((s) => s.key !== key) } : old
      );
      return { previous };
    },
    onError: (e: Error, _key, context) => {
      if (context?.previous) qc.setQueryData(["homepage-sections"], context.previous);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Section deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["homepage-sections"] }),
  });
}
