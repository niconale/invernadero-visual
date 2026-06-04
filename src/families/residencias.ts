import type { FamilyDefinition, LayoutPreset, FieldValues } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Vertical derecha", tokens: { verticalSide: "right", verticalOpacity: 0.95, blockBottom: 110 } },
  { id: "B", label: "Vertical izquierda", tokens: { verticalSide: "left", verticalOpacity: 0.95, blockBottom: 110 } },
  { id: "C", label: "Vertical translúcido", tokens: { verticalSide: "right", verticalOpacity: 0.55, blockBottom: 150 } },
];

const baseDefaults: FieldValues = {
  artista: "CÍA. DEL VIENTO",
  titulo: "CUERPOS SUSPENDIDOS",
  programa: "PROGRAMA DE RESIDENCIAS · GERMINACIÓN",
};

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
      defaultValues: baseDefaults,
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
      defaultValues: { ...baseDefaults, titulo: "DÍA 04", programa: "DIARIO DE PROCESO · RESIDENCIAS" },
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
      defaultValues: { ...baseDefaults, programa: "MUESTRA ABIERTA · RESIDENCIAS" },
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
      defaultValues: { artista: "CONVOCATORIA ABIERTA", titulo: "RESIDENCIAS 2026", programa: "CIERRE 30 JUNIO · MÁS INFO EN BIO" },
      fields: [
        { id: "artista", label: "Bajada", type: "text", maxLength: 40, required: true, placeholder: "CONVOCATORIA ABIERTA" },
        { id: "titulo", label: "Título", type: "text", maxLength: 50, required: true, placeholder: "RESIDENCIAS 2026" },
        { id: "programa", label: "Programa / cierre", type: "text", maxLength: 60, required: true, placeholder: "CIERRE 30 JUNIO · MÁS INFO EN BIO" },
      ],
      presets: PRESETS,
    },
  ],
};
