import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FieldValues, FormatId, PresetId } from "@/families/types";
import { FAMILIES, getTemplate } from "@/families";

export interface ImageState {
  url: string | null;
  zoom: number;
  x: number;
  y: number;
  brightness: number;
  overlay: number;
}

export interface MaskState {
  top: number;       // 0..100 intensity
  bottom: number;
  left: number;
  right: number;
  feather: number;   // 0..100 controls falloff softness
  size: number;      // 0..100 controls how far inward the mask reaches
  vignette: number;  // 0..100
}

export type BlockPos = { x: number; y: number };
/** Key = `${familyId}.${templateId}.${blockId}` */
export type BlockPositions = Record<string, BlockPos>;
export type BlockBooleans = Record<string, boolean>;
export type BlockSizes = Record<string, number>; // multiplier (1 = default)

export interface EditorState {
  familyId: string;
  templateId: string;
  format: FormatId;
  preset: PresetId;
  values: FieldValues;
  image: ImageState;
  mask: MaskState;
  blockPositions: BlockPositions;
  hiddenBlocks: BlockBooleans;
  blockSizes: BlockSizes;
  blockNoWrap: BlockBooleans;
  mergeHoraPublico: boolean;
  useSingleQuotes: boolean;
  snapping: boolean;
  showSafeZone: boolean;
  referenceCaptions: string;
  contexto: string;
  setFamily: (id: string) => void;
  setTemplate: (id: string) => void;
  setFormat: (f: FormatId) => void;
  setPreset: (p: PresetId) => void;
  setValue: (k: string, v: string) => void;
  setImage: (patch: Partial<ImageState>) => void;
  clearImage: () => void;
  setMask: (patch: Partial<MaskState>) => void;
  setBlockPos: (blockId: string, pos: BlockPos) => void;
  setBlockHidden: (blockId: string, hidden: boolean) => void;
  setBlockSize: (blockId: string, mult: number) => void;
  setBlockNoWrap: (blockId: string, noWrap: boolean) => void;
  setMergeHoraPublico: (v: boolean) => void;
  resetBlocks: () => void;
  toggleQuotes: () => void;
  setSnapping: (v: boolean) => void;
  setShowSafeZone: (v: boolean) => void;
  setReferenceCaptions: (v: string) => void;
  setContexto: (v: string) => void;
}

const defaultImage: ImageState = { url: null, zoom: 1, x: 0, y: 0, brightness: 50, overlay: 45 };
const defaultMask: MaskState = { top: 55, bottom: 70, left: 0, right: 0, feather: 60, size: 45, vignette: 15 };

export function blockKey(familyId: string, templateId: string, blockId: string) {
  return `${familyId}.${templateId}.${blockId}`;
}

function mergeValues(familyId: string, templateId: string, current: FieldValues): FieldValues {
  const tpl = (() => { try { return getTemplate(familyId, templateId); } catch { return null; } })();
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
      mask: defaultMask,
      blockPositions: {},
      hiddenBlocks: {},
      blockSizes: {},
      blockNoWrap: {},
      mergeHoraPublico: false,
      useSingleQuotes: true,
      snapping: false,
      showSafeZone: false,
      referenceCaptions: "",
      contexto: "",
      setFamily: (id) => {
        const fam = FAMILIES.find((f) => f.id === id);
        const tplId = fam?.templates[0].id ?? "";
        set({ familyId: id, templateId: tplId, values: mergeValues(id, tplId, get().values) });
      },
      setTemplate: (id) => set((s) => ({ templateId: id, values: mergeValues(s.familyId, id, s.values) })),
      setFormat: (f) => set({ format: f }),
      setPreset: (p) => set({ preset: p }),
      setValue: (k, v) => set((s) => ({ values: { ...s.values, [k]: v } })),
      setImage: (patch) => set((s) => ({ image: { ...s.image, ...patch } })),
      clearImage: () => set(() => ({ image: { ...defaultImage, url: null } })),
      setMask: (patch) => set((s) => ({ mask: { ...s.mask, ...patch } })),
      setBlockPos: (blockId, pos) => set((s) => ({
        blockPositions: { ...s.blockPositions, [blockKey(s.familyId, s.templateId, blockId)]: pos },
      })),
      setBlockHidden: (blockId, hidden) => set((s) => ({
        hiddenBlocks: { ...s.hiddenBlocks, [blockKey(s.familyId, s.templateId, blockId)]: hidden },
      })),
      setBlockSize: (blockId, mult) => set((s) => ({
        blockSizes: { ...s.blockSizes, [blockKey(s.familyId, s.templateId, blockId)]: mult },
      })),
      setBlockNoWrap: (blockId, noWrap) => set((s) => ({
        blockNoWrap: { ...s.blockNoWrap, [blockKey(s.familyId, s.templateId, blockId)]: noWrap },
      })),
      setMergeHoraPublico: (v) => set({ mergeHoraPublico: v }),
      resetBlocks: () => set((s) => {
        const prefix = `${s.familyId}.${s.templateId}.`;
        const filt = <T,>(obj: Record<string, T>) => {
          const next: Record<string, T> = {};
          for (const [k, v] of Object.entries(obj)) if (!k.startsWith(prefix)) next[k] = v;
          return next;
        };
        return {
          blockPositions: filt(s.blockPositions),
          hiddenBlocks: filt(s.hiddenBlocks),
          blockSizes: filt(s.blockSizes),
        };
      }),
      toggleQuotes: () => set((s) => ({ useSingleQuotes: !s.useSingleQuotes })),
      setSnapping: (v) => set({ snapping: v }),
      setShowSafeZone: (v) => set({ showSafeZone: v }),
      setReferenceCaptions: (v) => set({ referenceCaptions: v }),
      setContexto: (v) => set({ contexto: v }),
    }),
    {
      name: "invernadero-editor-v5",
      partialize: (s) => ({
        familyId: s.familyId,
        templateId: s.templateId,
        format: s.format,
        preset: s.preset,
        values: s.values,
        image: { ...s.image, url: null },
        mask: s.mask,
        blockPositions: s.blockPositions,
        hiddenBlocks: s.hiddenBlocks,
        blockSizes: s.blockSizes,
        mergeHoraPublico: s.mergeHoraPublico,
        useSingleQuotes: s.useSingleQuotes,
        snapping: s.snapping,
        showSafeZone: s.showSafeZone,
        referenceCaptions: s.referenceCaptions,
        contexto: s.contexto,
      }),
    },
  ),
);

export function useCurrentTemplate() {
  const { familyId, templateId } = useEditor();
  try { return getTemplate(familyId, templateId); } catch { return FAMILIES[0].templates[0]; }
}
