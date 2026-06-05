import type { FamilyDefinition, LayoutPreset, FieldValues, BlockDef } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Estándar" },
  {
    id: "B",
    label: "Título grande",
    overrides: { titulo: { fontSize: 150 } },
  },
  {
    id: "C",
    label: "Centrado",
    overrides: {
      titulo: { align: "center", x: 50 },
      subtitulo: { align: "center", x: 50 },
    },
  },
];

const baseDefaults: FieldValues = {
  etiqueta: "ESCUELA · VERANO",
  titulo: "ACRODANZA",
  subtitulo: "Vie 27: individual · Sáb 28: grupal · 30€ cada uno, los dos 50€",
  dato1: "27-28 JUN",
  dato1Label: "DÍAS",
  dato2: "17-20 / 12-15",
  dato2Label: "HORARIO",
  dato3: "30·50€",
  dato3Label: "INTENSIVOS",
  rango: "1 – 29 JUL",
};

const blocks: BlockDef[] = [
  // Bottom dark green panel
  {
    id: "bottomPanel",
    label: "Bloque inferior",
    kind: "panel",
    x: 0, y: 62, align: "left",
    fontFamily: "dm", fontSize: 0,
    color: "white", background: "dark",
    panelW: 100, panelH: 38,
    bgOpacity: 0.82,
    borderTopColor: "family",
    borderTopWidth: 4,
  },
  // Top-right etiqueta tag
  {
    id: "etiqueta",
    label: "Etiqueta superior",
    kind: "cta",
    bind: "etiqueta",
    x: 94, y: 5, align: "right",
    fontFamily: "dm", fontSize: 24, letterSpacing: "0.18em", weight: 600,
    color: "white", background: "family", uppercase: true, padding: 12,
  },
  // Small range top-left
  {
    id: "rango",
    label: "Rango fechas",
    kind: "text",
    bind: "rango",
    x: 6, y: 6, align: "left",
    fontFamily: "dm", fontSize: 22, letterSpacing: "0.18em", weight: 600,
    color: "white", uppercase: true,
  },
  // Main title
  {
    id: "titulo",
    label: "Título principal",
    kind: "text",
    bind: "titulo",
    x: 6, y: 67, align: "left", maxW: 90,
    fontFamily: "bebas", fontSize: 128, lineHeight: 0.92, letterSpacing: "-0.01em",
    color: "white", uppercase: true,
  },
  // Subtitle
  {
    id: "subtitulo",
    label: "Subtítulo",
    kind: "text",
    bind: "subtitulo",
    x: 6, y: 80, align: "left", maxW: 88,
    fontFamily: "dm", fontSize: 24, lineHeight: 1.35, weight: 400,
    color: "cream",
  },
  // 3 data blocks bottom row
  {
    id: "dato1",
    label: "Dato 1",
    kind: "data-stack",
    bind: "dato1",
    bindLabel: "dato1Label",
    x: 6, y: 89, align: "left",
    fontFamily: "bebas", fontSize: 56, lineHeight: 1, letterSpacing: "0em",
    color: "white", uppercase: true, labelSize: 16,
  },
  {
    id: "dato2",
    label: "Dato 2",
    kind: "data-stack",
    bind: "dato2",
    bindLabel: "dato2Label",
    x: 36, y: 89, align: "left",
    fontFamily: "bebas", fontSize: 56, lineHeight: 1,
    color: "white", uppercase: true, labelSize: 16,
  },
  {
    id: "dato3",
    label: "Dato 3",
    kind: "data-stack",
    bind: "dato3",
    bindLabel: "dato3Label",
    x: 66, y: 89, align: "left",
    fontFamily: "bebas", fontSize: 56, lineHeight: 1,
    color: "family", uppercase: true, labelSize: 16,
  },
];

export const escuela: FamilyDefinition = {
  id: "escuela",
  label: "ESCUELA",
  color: "#4A7FA5",
  colorDark: "#1C2E1E",
  textOnColor: "#FFFFFF",
  templates: [
    {
      id: "verano",
      label: "Escuela · Verano",
      description: "Clases e intensivos de verano.",
      requiresPhoto: true,
      defaultValues: baseDefaults,
      presets: PRESETS,
      blocks,
      fields: [
        { id: "etiqueta", label: "Etiqueta superior", type: "text", maxLength: 32 },
        { id: "rango", label: "Rango fechas (pequeño)", type: "text", maxLength: 24 },
        { id: "titulo", label: "Título principal", type: "text", maxLength: 30, required: true,
          options: ["ACRODANZA", "FLEXIBILIDAD", "TELAS AÉREAS", "ACROBACIAS", "TELAS Y CUERDA", "STRAPS"] },
        { id: "subtitulo", label: "Subtítulo", type: "textarea", maxLength: 140 },
        { id: "dato1", label: "Dato 1 — valor", type: "text", maxLength: 20 },
        { id: "dato1Label", label: "Dato 1 — etiqueta", type: "text", maxLength: 16 },
        { id: "dato2", label: "Dato 2 — valor", type: "text", maxLength: 20 },
        { id: "dato2Label", label: "Dato 2 — etiqueta", type: "text", maxLength: 16 },
        { id: "dato3", label: "Dato 3 — valor", type: "text", maxLength: 20 },
        { id: "dato3Label", label: "Dato 3 — etiqueta", type: "text", maxLength: 16 },
      ],
    },
  ],
};
