import type { FamilyDefinition, LayoutPreset, FieldValues, BlockDef } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Vertical a la derecha" },
  {
    id: "B",
    label: "Vertical a la izquierda",
    overrides: {
      titleFamily: { x: 4, align: "left" },
      artista: { x: 18 },
      titulo: { x: 18 },
      programa: { x: 18 },
    },
  },
  {
    id: "C",
    label: "Bloque más alto",
    overrides: {
      artista: { y: 60 },
      titulo: { y: 70 },
      programa: { y: 80 },
    },
  },
];

const baseDefaults: FieldValues = {
  artista: "CÍA. DEL VIENTO",
  titulo: "CUERPOS SUSPENDIDOS",
  programa: "PROGRAMA DE RESIDENCIAS · GERMINACIÓN",
};

const blocks: BlockDef[] = [
  {
    id: "titleFamily",
    label: "Título de familia (vertical)",
    kind: "vertical",
    staticText: "RESIDENCIAS",
    x: 90, y: 8, align: "right",
    fontFamily: "bebas", fontSize: 168, lineHeight: 0.9, letterSpacing: "0.02em",
    color: "family", uppercase: true,
  },
  {
    id: "artista",
    label: "Artista / compañía",
    kind: "text",
    bind: "artista",
    x: 6.5, y: 70, align: "left", maxW: 70,
    fontFamily: "bebas", fontSize: 88, lineHeight: 0.9,
    color: "family", uppercase: true,
  },
  {
    id: "titulo",
    label: "Proyecto",
    kind: "text",
    bind: "titulo",
    x: 6.5, y: 80, align: "left", maxW: 70,
    fontFamily: "bebas", fontSize: 64, lineHeight: 0.95,
    color: "white", uppercase: true, quote: true,
    wrapControl: true, defaultNoWrap: false,
  },
  {
    id: "programa",
    label: "Programa / línea",
    kind: "text",
    bind: "programa",
    x: 6.5, y: 90, align: "left", maxW: 70,
    fontFamily: "dm", fontSize: 22, letterSpacing: "0.18em", lineHeight: 1.35, weight: 500,
    color: "white", uppercase: true,
  },
];

const tplBase = (id: string, label: string, description: string, defaults: FieldValues, fields: any[]) => ({
  id, label, description, requiresPhoto: true, defaultValues: defaults, fields, presets: PRESETS, blocks,
});

export const residencias: FamilyDefinition = {
  id: "residencias",
  label: "RESIDENCIAS",
  color: "#6E2D5C",
  colorDark: "#522041",
  textOnColor: "#F3EDE0",
  templates: [
    tplBase("germinacion", "Germinación", "Residencia en programa Germinación.", baseDefaults, [
      { id: "artista", label: "Artista / compañía", type: "text", maxLength: 40, required: true },
      { id: "titulo", label: "Proyecto", type: "text", maxLength: 50, required: true },
      { id: "programa", label: "Programa / línea", type: "text", maxLength: 60, required: true },
    ]),
    tplBase("proceso", "Proceso / diario", "Entrada de diario de proceso.",
      { ...baseDefaults, titulo: "DÍA 04", programa: "DIARIO DE PROCESO · RESIDENCIAS" },
      [
        { id: "artista", label: "Artista", type: "text", maxLength: 40, required: true },
        { id: "titulo", label: "Título de la entrada", type: "text", maxLength: 50, required: true },
        { id: "programa", label: "Programa", type: "text", maxLength: 60, required: true },
      ]),
    tplBase("salida", "Muestra / salida", "Muestra abierta de residencia.",
      { ...baseDefaults, programa: "MUESTRA ABIERTA · RESIDENCIAS" },
      [
        { id: "artista", label: "Artista", type: "text", maxLength: 40, required: true },
        { id: "titulo", label: "Proyecto", type: "text", maxLength: 50, required: true },
        { id: "programa", label: "Programa", type: "text", maxLength: 60, required: true },
      ]),
    tplBase("convocatoria", "Convocatoria", "Llamado a residentes.",
      { artista: "CONVOCATORIA ABIERTA", titulo: "RESIDENCIAS 2026", programa: "CIERRE 30 JUNIO · MÁS INFO EN BIO" },
      [
        { id: "artista", label: "Bajada", type: "text", maxLength: 40, required: true },
        { id: "titulo", label: "Título", type: "text", maxLength: 50, required: true },
        { id: "programa", label: "Programa / cierre", type: "text", maxLength: 60, required: true },
      ]),
  ],
};
