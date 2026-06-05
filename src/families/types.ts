export type FormatId = "4:5" | "9:16";

export const FORMATS: Record<FormatId, { w: number; h: number; label: string }> = {
  "4:5": { w: 1080, h: 1350, label: "Feed 4:5" },
  "9:16": { w: 1080, h: 1920, label: "Story 9:16" },
};

export type FieldType = "text" | "textarea" | "date" | "select";

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  required?: boolean;
}

export type BlockKind = "text" | "vertical" | "date-box" | "cta" | "panel" | "data-stack";
export type ColorRole = "family" | "white" | "cream" | "dark";

export interface BlockDef {
  id: string;
  label: string;
  kind: BlockKind;
  /** Position 0..100 (% of canvas) — anchor point depends on `align`. */
  x: number;
  y: number;
  /** Max width for wrapping, in % of canvas. */
  maxW?: number;
  align: "left" | "center" | "right";
  fontFamily: "bebas" | "dm";
  fontSize: number; // px in canvas coords (1080x1350)
  letterSpacing?: string;
  lineHeight?: number;
  weight?: number;
  color: ColorRole;
  /** For date-box / cta: background color role. */
  background?: ColorRole;
  uppercase?: boolean;
  /** If true and the global quote-toggle is on, wrap text in 'single quotes'. */
  quote?: boolean;
  /** For date-box: subfont size for month label. */
  monthScale?: number;
  /** For vertical: side hint (visual only, position controlled by x/y). */
  /** Field id this block binds to in `values`. Static label if missing. */
  bind?: string;
  /** Static text used when there's no bind (e.g. family label). */
  staticText?: string;
  /** Padding for box-style blocks (date-box, cta) in px. */
  padding?: number;
  /** For panel: width/height in % of canvas. */
  panelW?: number;
  panelH?: number;
  /** For panel: top border color role + thickness px. */
  borderTopColor?: ColorRole;
  borderTopWidth?: number;
  /** For panel: background opacity 0..1 (multiplied with color). */
  bgOpacity?: number;
  /** For data-stack: secondary label text bound (e.g. "DÍAS"). */
  bindLabel?: string;
  staticLabel?: string;
  labelSize?: number;
}

export type PresetId = "A" | "B" | "C";

export interface LayoutPreset {
  id: PresetId;
  label: string;
  /** Optional overrides for specific block positions by id. */
  overrides?: Record<string, Partial<Pick<BlockDef, "x" | "y" | "align" | "fontSize">>>;
}

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
  presets: LayoutPreset[];
  blocks: BlockDef[];
  requiresPhoto?: boolean;
  defaultValues?: FieldValues;
}

export interface FamilyDefinition {
  id: string;
  label: string;
  color: string; // hex (family color)
  colorDark: string;
  textOnColor: string; // hex
  templates: TemplateDefinition[];
}

export type FieldValues = Record<string, string>;
