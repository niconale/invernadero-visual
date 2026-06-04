import type { FamilyDefinition, LayoutPreset } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "Foto + bloque abajo izq.", block: "abajo-izq", variant: "foto", accent: "estandar" },
  { id: "B", label: "Color sólido + texto centro", block: "centro", variant: "color", accent: "estandar" },
  { id: "C", label: "Foto + marco + abajo centro", block: "abajo-centro", variant: "foto", accent: "marco" },
];

export const residencias: FamilyDefinition = {
  id: "residencias",
  label: "Residencias",
  color: "#6E2D5C",
  colorDark: "#522041",
  textOnColor: "#F3EDE0",
  templates: [
    {
      id: "presentacion",
      label: "Presentación de residencia",
      description: "Quién está investigando qué.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título / proyecto", type: "text", maxLength: 50, required: true, placeholder: "Cuerpos suspendidos" },
        { id: "artista", label: "Artista / compañía", type: "text", maxLength: 50, required: true },
        { id: "periodo", label: "Período", type: "text", maxLength: 30, placeholder: "Junio – Agosto 2026" },
        { id: "descripcion", label: "Descripción breve", type: "textarea", maxLength: 140 },
      ],
      presets: PRESETS,
    },
    {
      id: "diario",
      label: "Diario de proceso",
      description: "Una entrada de proceso.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título de la entrada", type: "text", maxLength: 50, required: true, placeholder: "Día 04" },
        { id: "artista", label: "Artista", type: "text", maxLength: 40 },
        { id: "nota", label: "Nota corta", type: "textarea", maxLength: 200, required: true },
      ],
      presets: PRESETS,
    },
    {
      id: "germinacion",
      label: "Germinación / convocatoria",
      description: "Llamado a residentes.",
      fields: [
        { id: "titulo", label: "Título", type: "text", maxLength: 40, required: true, placeholder: "Convocatoria abierta" },
        { id: "subtitulo", label: "Bajada", type: "text", maxLength: 80 },
        { id: "fecha", label: "Cierre", type: "text", maxLength: 30, required: true, placeholder: "Hasta 30 de junio" },
        { id: "cta", label: "CTA", type: "text", maxLength: 60, required: true, placeholder: "Más info en bio" },
      ],
      presets: PRESETS,
    },
    {
      id: "salida",
      label: "Muestra / salida",
      description: "Muestra abierta de residencia.",
      requiresPhoto: true,
      fields: [
        { id: "titulo", label: "Título", type: "text", maxLength: 50, required: true, placeholder: "Muestra abierta" },
        { id: "artista", label: "Artista", type: "text", maxLength: 50 },
        { id: "fecha", label: "Fecha y hora", type: "text", maxLength: 40, required: true },
        { id: "lugar", label: "Lugar", type: "text", maxLength: 40, placeholder: "El Invernadero Circo" },
        { id: "cta", label: "CTA", type: "text", maxLength: 60, placeholder: "Entrada libre" },
      ],
      presets: PRESETS,
    },
  ],
};
