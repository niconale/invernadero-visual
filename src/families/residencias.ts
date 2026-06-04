import type { FamilyDefinition, LayoutPreset } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Vertical derecha", block: "abajo-izq", variant: "foto", accent: "estandar" },
  { id: "B", label: "Vertical izquierda", block: "abajo-der", variant: "foto", accent: "estandar" },
  { id: "C", label: "Bloque alto · vertical translúcido", block: "abajo-izq", variant: "foto", accent: "marco" },
];

export const residencias: FamilyDefinition = {
  id: "residencias",
  label: "RESIDENCIAS",
  color: "#6E2D5C",
  colorDark: "#522041",
  textOnColor: "#F3EDE0",
  templates: [
    {
      id: "germinacion",
      label: "Germinación",
      description: "Residencia en programa Germinación.",
      requiresPhoto: true,
      fields: [
        { id: "artista", label: "Artista / compañía", type: "text", maxLength: 40, required: true, placeholder: "CÍA. DEL VIENTO" },
        { id: "titulo", label: "Proyecto", type: "text", maxLength: 50, required: true, placeholder: "CUERPOS SUSPENDIDOS" },
        { id: "programa", label: "Programa / línea", type: "text", maxLength: 60, required: true, placeholder: "PROGRAMA DE RESIDENCIAS · GERMINACIÓN" },
      ],
      presets: PRESETS,
    },
    {
      id: "proceso",
      label: "Proceso / diario",
      description: "Entrada de diario de proceso.",
      requiresPhoto: true,
      fields: [
        { id: "artista", label: "Artista", type: "text", maxLength: 40, required: true },
        { id: "titulo", label: "Título de la entrada", type: "text", maxLength: 50, required: true, placeholder: "DÍA 04" },
        { id: "programa", label: "Programa", type: "text", maxLength: 60, required: true, placeholder: "DIARIO DE PROCESO · RESIDENCIAS" },
      ],
      presets: PRESETS,
    },
    {
      id: "salida",
      label: "Muestra / salida",
      description: "Muestra abierta de residencia.",
      requiresPhoto: true,
      fields: [
        { id: "artista", label: "Artista", type: "text", maxLength: 40, required: true },
        { id: "titulo", label: "Proyecto", type: "text", maxLength: 50, required: true },
        { id: "programa", label: "Programa / línea", type: "text", maxLength: 60, required: true, placeholder: "MUESTRA ABIERTA · RESIDENCIAS" },
      ],
      presets: PRESETS,
    },
    {
      id: "convocatoria",
      label: "Convocatoria",
      description: "Llamado a residentes.",
      requiresPhoto: true,
      fields: [
        { id: "artista", label: "Bajada", type: "text", maxLength: 40, required: true, placeholder: "CONVOCATORIA ABIERTA" },
        { id: "titulo", label: "Título", type: "text", maxLength: 50, required: true, placeholder: "RESIDENCIAS 2026" },
        { id: "programa", label: "Programa / cierre", type: "text", maxLength: 60, required: true, placeholder: "CIERRE 30 JUNIO · MÁS INFO EN BIO" },
      ],
      presets: PRESETS,
    },
  ],
};
