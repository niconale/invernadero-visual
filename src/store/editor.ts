import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FieldValues, FormatId, PresetId } from "@/families/types";
import { FAMILIES, getTemplate } from "@/families";

export interface ImageState {
  url: string | null; // objectURL (not persisted)
  zoom: number; // 1..3
  x: number; // -50..50 (% offset from center)
  y: number;
  brightness: number; // 0..100 (perceived; user-set)
  overlay: number; // 0..80 (% darkening overlay)
}

export interface EditorState {
  familyId: string;
  templateId: string;
  format: FormatId;
  preset: PresetId;
  values: FieldValues;
  image: ImageState;
  setFamily: (id: string) => void;
  setTemplate: (id: string) => void;
  setFormat: (f: FormatId) => void;
  setPreset: (p: PresetId) => void;
  setValue: (k: string, v: string) => void;
  setImage: (patch: Partial<ImageState>) => void;
  clearImage: () => void;
}

const defaultImage: ImageState = {
  url: null,
  zoom: 1,
  x: 0,
  y: 0,
  brightness: 50,
  overlay: 45,
};

// Merge: keep existing values for keys that the new template also uses;
// fill missing keys from the template's defaultValues. Never wipe blindly.
function mergeValues(familyId: string, templateId: string, current: FieldValues): FieldValues {
  const tpl = (() => {
    try { return getTemplate(familyId, templateId); } catch { return null; }
  })();
  if (!tpl) return current;
  const fieldIds = new Set(tpl.fields.map((f) => f.id));
  const defaults = tpl.defaultValues ?? {};
  const next: FieldValues = {};
  for (const id of fieldIds) {
    const v = current[id];
    next[id] = v != null && v !== "" ? v : (defaults[id] ?? "");
  }
  return next;
}

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => ({
      familyId: "programacion",
      templateId: FAMILIES[0].templates[0].id,
      format: "4:5",
      preset: "A",
      values: { ...(FAMILIES[0].templates[0].defaultValues ?? {}) },
      image: defaultImage,
      setFamily: (id) => {
        const fam = FAMILIES.find((f) => f.id === id);
        const tplId = fam?.templates[0].id ?? "";
        set({
          familyId: id,
          templateId: tplId,
          values: mergeValues(id, tplId, get().values),
        });
      },
      setTemplate: (id) =>
        set((s) => ({ templateId: id, values: mergeValues(s.familyId, id, s.values) })),
      setFormat: (f) => set({ format: f }),
      setPreset: (p) => set({ preset: p }),
      setValue: (k, v) => set((s) => ({ values: { ...s.values, [k]: v } })),
      setImage: (patch) => set((s) => ({ image: { ...s.image, ...patch } })),
      clearImage: () => set(() => ({ image: { ...defaultImage, url: null } })),
    }),
    {
      name: "invernadero-editor-v3",
      partialize: (s) => ({
        familyId: s.familyId,
        templateId: s.templateId,
        format: s.format,
        preset: s.preset,
        values: s.values,
        image: { ...s.image, url: null },
      }),
    },
  ),
);

export function useCurrentTemplate() {
  const { familyId, templateId } = useEditor();
  try {
    return getTemplate(familyId, templateId);
  } catch {
    return FAMILIES[0].templates[0];
  }
}
