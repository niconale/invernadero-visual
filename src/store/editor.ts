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
  top: number;
  bottom: number;
  left: number;
  right: number;
  feather: number;
  size: number;
  vignette: number;
  /** Graduated mask plateau: % of canvas from the edge that stays at full intensity before the gradient begins falling off. FCP-style. */
  topStart: number;
  bottomStart: number;
}


export type BlockPos = { x: number; y: number };
export type BlockPositions = Record<string, BlockPos>;
export type BlockBooleans = Record<string, boolean>;
export type BlockSizes = Record<string, number>;
export type PanelDims = { w?: number; h?: number };
export type BlockPanelDims = Record<string, PanelDims>;
export type GuideState = { x: number; y: number; showX: boolean; showY: boolean };

export interface PieceState {
  image: ImageState;
  mask: MaskState;
}

export interface EditorState {
  familyId: string;
  templateId: string;
  format: FormatId;
  preset: PresetId;
  values: FieldValues;
  image: ImageState;
  mask: MaskState;
  /** Snapshot of image+mask per family|template|format. */
  pieces: Record<string, PieceState>;
  blockPositions: BlockPositions;
  hiddenBlocks: BlockBooleans;
  blockSizes: BlockSizes;
  blockPanelDims: BlockPanelDims;
  blockNoWrap: BlockBooleans;
  mergeHoraPublico: boolean;
  useSingleQuotes: boolean;
  snapping: boolean;
  showSafeZone: boolean;
  referenceCaptions: string;
  contexto: string;
  guides: Record<FormatId, GuideState>;
  /** Custom display font for Residencias (data URL of .woff2/.otf/.ttf). */
  residenciasFont: { dataUrl: string; mime: string; name: string } | null;
  setResidenciasFont: (font: { dataUrl: string; mime: string; name: string } | null) => void;

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
  setBlockPanelDim: (blockId: string, patch: PanelDims) => void;
  setBlockNoWrap: (blockId: string, noWrap: boolean) => void;
  setMergeHoraPublico: (v: boolean) => void;
  resetBlocks: () => void;
  toggleQuotes: () => void;
  setSnapping: (v: boolean) => void;
  setShowSafeZone: (v: boolean) => void;
  setReferenceCaptions: (v: string) => void;
  setContexto: (v: string) => void;
  setGuide: (format: FormatId, patch: Partial<GuideState>) => void;
}

const defaultImage: ImageState = { url: null, zoom: 1, x: 0, y: 0, brightness: 50, overlay: 45 };
const defaultMask: MaskState = { top: 55, bottom: 70, left: 0, right: 0, feather: 60, size: 45, vignette: 15, topStart: 0, bottomStart: 0 };


export function blockKey(familyId: string, templateId: string, blockId: string) {
  return `${familyId}.${templateId}.${blockId}`;
}
/** Per-format key, used for positions, sizes, visibility, panel dims, noWrap. */
export function posKey(familyId: string, templateId: string, blockId: string, format: FormatId) {
  return format === "9:16"
    ? `${familyId}.${templateId}.${blockId}@story`
    : `${familyId}.${templateId}.${blockId}`;
}
/** Per-piece key for image + mask state (family|template|format). */
export function pieceKey(familyId: string, templateId: string, format: FormatId) {
  return `${familyId}|${templateId}|${format}`;
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

/** Snapshot current image+mask into pieces, load target piece (or defaults). */
function switchPiece(
  state: EditorState,
  nextFamily: string,
  nextTemplate: string,
  nextFormat: FormatId,
): Partial<EditorState> {
  const prevKey = pieceKey(state.familyId, state.templateId, state.format);
  const nextKey = pieceKey(nextFamily, nextTemplate, nextFormat);
  if (prevKey === nextKey) return {};
  const pieces = { ...state.pieces, [prevKey]: { image: state.image, mask: state.mask } };
  const target = pieces[nextKey];
  return {
    pieces,
    image: target ? target.image : { ...defaultImage, url: null },
    mask: target ? target.mask : { ...defaultMask },
  };
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
      pieces: {},
      blockPositions: {},
      hiddenBlocks: {},
      blockSizes: {},
      blockPanelDims: {},
      blockNoWrap: {},
      mergeHoraPublico: false,
      useSingleQuotes: true,
      snapping: false,
      showSafeZone: false,
      referenceCaptions: "",
      contexto: "",
      guides: { "4:5": { x: 50, y: 50, showX: false, showY: false }, "9:16": { x: 50, y: 50, showX: false, showY: false } },
      residenciasFont: null,
      setResidenciasFont: (font) => set({ residenciasFont: font }),
      setGuide: (format, patch) => set((s) => ({ guides: { ...s.guides, [format]: { ...s.guides[format], ...patch } } })),

      setFamily: (id) => set((s) => {
        const fam = FAMILIES.find((f) => f.id === id);
        const tplId = fam?.templates[0].id ?? "";
        return {
          familyId: id,
          templateId: tplId,
          values: mergeValues(id, tplId, s.values),
          ...switchPiece(s, id, tplId, s.format),
        };
      }),
      setTemplate: (id) => set((s) => ({
        templateId: id,
        values: mergeValues(s.familyId, id, s.values),
        ...switchPiece(s, s.familyId, id, s.format),
      })),
      setFormat: (f) => set((s) => ({
        format: f,
        ...switchPiece(s, s.familyId, s.templateId, f),
      })),
      setPreset: (p) => set({ preset: p }),
      setValue: (k, v) => set((s) => ({ values: { ...s.values, [k]: v } })),
      setImage: (patch) => set((s) => {
        const image = { ...s.image, ...patch };
        const k = pieceKey(s.familyId, s.templateId, s.format);
        return { image, pieces: { ...s.pieces, [k]: { image, mask: s.mask } } };
      }),
      clearImage: () => set((s) => {
        const image = { ...defaultImage, url: null };
        const k = pieceKey(s.familyId, s.templateId, s.format);
        return { image, pieces: { ...s.pieces, [k]: { image, mask: s.mask } } };
      }),
      setMask: (patch) => set((s) => {
        const mask = { ...s.mask, ...patch };
        const k = pieceKey(s.familyId, s.templateId, s.format);
        return { mask, pieces: { ...s.pieces, [k]: { image: s.image, mask } } };
      }),
      setBlockPos: (blockId, pos) => set((s) => ({
        blockPositions: { ...s.blockPositions, [posKey(s.familyId, s.templateId, blockId, s.format)]: pos },
      })),
      setBlockHidden: (blockId, hidden) => set((s) => ({
        hiddenBlocks: { ...s.hiddenBlocks, [posKey(s.familyId, s.templateId, blockId, s.format)]: hidden },
      })),
      setBlockSize: (blockId, mult) => set((s) => ({
        blockSizes: { ...s.blockSizes, [posKey(s.familyId, s.templateId, blockId, s.format)]: mult },
      })),
      setBlockPanelDim: (blockId, patch) => set((s) => {
        const k = posKey(s.familyId, s.templateId, blockId, s.format);
        return { blockPanelDims: { ...s.blockPanelDims, [k]: { ...s.blockPanelDims[k], ...patch } } };
      }),
      setBlockNoWrap: (blockId, noWrap) => set((s) => ({
        blockNoWrap: { ...s.blockNoWrap, [posKey(s.familyId, s.templateId, blockId, s.format)]: noWrap },
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
          blockPanelDims: filt(s.blockPanelDims),
          blockNoWrap: filt(s.blockNoWrap),
        };
      }),
      toggleQuotes: () => set((s) => ({ useSingleQuotes: !s.useSingleQuotes })),
      setSnapping: (v) => set({ snapping: v }),
      setShowSafeZone: (v) => set({ showSafeZone: v }),
      setReferenceCaptions: (v) => set({ referenceCaptions: v }),
      setContexto: (v) => set({ contexto: v }),
    }),
    {
      name: "invernadero-editor-v6",
      partialize: (s) => ({
        familyId: s.familyId,
        templateId: s.templateId,
        format: s.format,
        preset: s.preset,
        values: s.values,
        image: { ...s.image, url: null },
        mask: s.mask,
        // strip blob URLs from persisted pieces; user re-uploads images per session
        pieces: Object.fromEntries(
          Object.entries(s.pieces).map(([k, v]) => [k, { image: { ...v.image, url: null }, mask: v.mask }]),
        ),
        blockPositions: s.blockPositions,
        hiddenBlocks: s.hiddenBlocks,
        blockSizes: s.blockSizes,
        blockPanelDims: s.blockPanelDims,
        blockNoWrap: s.blockNoWrap,
        mergeHoraPublico: s.mergeHoraPublico,
        useSingleQuotes: s.useSingleQuotes,
        snapping: s.snapping,
        showSafeZone: s.showSafeZone,
        referenceCaptions: s.referenceCaptions,
        contexto: s.contexto,
        guides: s.guides,
        residenciasFont: s.residenciasFont,
      }),
    },
  ),
);


export function useCurrentTemplate() {
  const { familyId, templateId } = useEditor();
  try { return getTemplate(familyId, templateId); } catch { return FAMILIES[0].templates[0]; }
}
