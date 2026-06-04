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
  textColor: "crema" | "blanco" | "negro";
  image: ImageState;
  setFamily: (id: string) => void;
  setTemplate: (id: string) => void;
  setFormat: (f: FormatId) => void;
  setPreset: (p: PresetId) => void;
  setValue: (k: string, v: string) => void;
  setTextColor: (c: "crema" | "blanco" | "negro") => void;
  setImage: (patch: Partial<ImageState>) => void;
  clearImage: () => void;
}

const defaultImage: ImageState = {
  url: null,
  zoom: 1,
  x: 0,
  y: 0,
  brightness: 50,
  overlay: 35,
};

export const useEditor = create<EditorState>()(
  persist(
    (set) => ({
      familyId: "programacion",
      templateId: FAMILIES[0].templates[0].id,
      format: "4:5",
      preset: "A",
      values: {
        dia: "14",
        mes: "JUNIO",
        titulo: "PIES SOBRE LA TIERRA",
        hora: "21:00 H",
        publico: "TODO PÚBLICO",
        cta: "ENTRADAS DISPONIBLES",
      },
      textColor: "crema",
      image: defaultImage,
      setFamily: (id) => {
        const tpl = FAMILIES.find((f) => f.id === id)?.templates[0];
        set({ familyId: id, templateId: tpl?.id ?? "", values: {}, preset: "A" });
      },
      setTemplate: (id) => set({ templateId: id, values: {}, preset: "A" }),
      setFormat: (f) => set({ format: f }),
      setPreset: (p) => set({ preset: p }),
      setValue: (k, v) => set((s) => ({ values: { ...s.values, [k]: v } })),
      setTextColor: (c) => set({ textColor: c }),
      setImage: (patch) => set((s) => ({ image: { ...s.image, ...patch } })),
      clearImage: () => set((s) => ({ image: { ...defaultImage, url: null } })),
    }),
    {
      name: "invernadero-editor-v1",
      partialize: (s) => ({
        familyId: s.familyId,
        templateId: s.templateId,
        format: s.format,
        preset: s.preset,
        values: s.values,
        textColor: s.textColor,
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
