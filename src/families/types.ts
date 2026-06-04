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

export type PresetId = "A" | "B" | "C";

export interface LayoutPreset {
  id: PresetId;
  label: string;
  // Minimal token-only variations. Never changes structure, colors or typography.
  tokens: {
    // Programación
    ctaAlign?: "center" | "left";
    titleScale?: number; // multiplier on base title size, ~0.95..1.08
    // Residencias
    verticalSide?: "right" | "left";
    verticalOpacity?: number; // 0.6..1
    blockBottom?: number; // px from bottom of safe zone
  };
}

export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
  presets: LayoutPreset[];
  requiresPhoto?: boolean;
  defaultValues?: FieldValues;
  copyPromptHint?: string;
}

export interface FamilyDefinition {
  id: string;
  label: string;
  color: string; // hex
  colorDark: string;
  textOnColor: string; // hex
  templates: TemplateDefinition[];
}

export type FieldValues = Record<string, string>;
