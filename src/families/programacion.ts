import type { FamilyDefinition, LayoutPreset, FieldValues } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "CTA centrado", tokens: { ctaAlign: "center", titleScale: 1 } },
  { id: "B", label: "CTA alineado a la izquierda", tokens: { ctaAlign: "left", titleScale: 1 } },
  { id: "C", label: "Título dominante", tokens: { ctaAlign: "center", titleScale: 1.08 } },
];

const baseDefaults: FieldValues = {
  dia: "14",
  mes: "JUNIO",
  titulo: "PIES SOBRE LA TIERRA",
  hora: "21:00 H",
  publico: "TODO PÚBLICO",
  cta: "ENTRADAS DISPONIBLES",
};

export const programacion: FamilyDefinition = {
  id: "programacion",
  label: "PROGRAMACIÓN",
  color: "#B5451E",
  colorDark: "#7E2F12",
  textOnColor: "#FFFFFF",
  templates: [
    {
      id: "funcion",
      label: "Función",
      description: "Anuncio principal de una función con fecha, hora y CTA.",
      requiresPhoto: true,
      defaultValues: baseDefaults,
      fields: [
        { id: "dia", label: "Día (número)", type: "text", maxLength: 2, required: true, placeholder: "14" },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true, placeholder: "JUNIO" },
        { id: "titulo", label: "Nombre del espectáculo", type: "text", maxLength: 40, required: true, placeholder: "PIES SOBRE LA TIERRA" },
        { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true, placeholder: "21:00 H" },
        { id: "publico", label: "Público", type: "text", maxLength: 30, placeholder: "TODO PÚBLICO" },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true, placeholder: "ENTRADAS DISPONIBLES" },
      ],
      presets: PRESETS,
    },
    {
      id: "teaser",
      label: "Teaser / próximamente",
      description: "Aviso anticipado.",
      requiresPhoto: true,
      defaultValues: { ...baseDefaults, titulo: "PRÓXIMAMENTE", hora: "UNA NUEVA OBRA", publico: "", cta: "MÁS INFO PRONTO" },
      fields: [
        { id: "dia", label: "Día", type: "text", maxLength: 2, placeholder: "" },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, placeholder: "JUNIO" },
        { id: "titulo", label: "Título", type: "text", maxLength: 40, required: true, placeholder: "PRÓXIMAMENTE" },
        { id: "hora", label: "Subtítulo", type: "text", maxLength: 30, placeholder: "UNA NUEVA OBRA" },
        { id: "publico", label: "Público / nota", type: "text", maxLength: 30 },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true, placeholder: "MÁS INFO PRONTO" },
      ],
      presets: PRESETS,
    },
    {
      id: "ultima",
      label: "Última función",
      description: "Urgencia: última oportunidad.",
      requiresPhoto: true,
      defaultValues: { ...baseDefaults, cta: "ÚLTIMAS ENTRADAS" },
      fields: [
        { id: "dia", label: "Día", type: "text", maxLength: 2, required: true },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true },
        { id: "titulo", label: "Espectáculo", type: "text", maxLength: 40, required: true },
        { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true },
        { id: "publico", label: "Público", type: "text", maxLength: 30 },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true, placeholder: "ÚLTIMAS ENTRADAS" },
      ],
      presets: PRESETS,
    },
    {
      id: "entradas",
      label: "Entradas a la venta",
      description: "Apertura de venta.",
      requiresPhoto: true,
      defaultValues: { ...baseDefaults, cta: "ENTRADAS A LA VENTA" },
      fields: [
        { id: "dia", label: "Día", type: "text", maxLength: 2, required: true },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true },
        { id: "titulo", label: "Espectáculo", type: "text", maxLength: 40, required: true },
        { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true },
        { id: "publico", label: "Público", type: "text", maxLength: 30 },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true, placeholder: "ENTRADAS A LA VENTA" },
      ],
      presets: PRESETS,
    },
  ],
};
