import type { FamilyDefinition, LayoutPreset, FieldValues, BlockDef } from "./types";

const PRESETS: LayoutPreset[] = [
  { id: "A", label: "CTA centrado" },
  {
    id: "B",
    label: "CTA a la izquierda",
    overrides: {
      titulo: { align: "left", x: 6.5 },
      horaPublico: { align: "left", x: 6.5 },
      cta: { align: "left", x: 6.5 },
    },
  },
  {
    id: "C",
    label: "Título dominante",
    overrides: {
      titleFamily: { fontSize: 118 },
      titulo: { fontSize: 88 },
    },
  },
];

const baseDefaults: FieldValues = {
  dia: "14",
  mes: "JUNIO",
  titulo: "PIES SOBRE LA TIERRA",
  hora: "21:00 H",
  publico: "PÚBLICO FAMILIAR",
  cta: "ENTRADAS DISPONIBLES",
};

const PUBLICO_OPTIONS = ["PÚBLICO FAMILIAR", "TODOS LOS PÚBLICOS", "PÚBLICO ADULTO"];

const blocks: BlockDef[] = [
  {
    id: "titleFamily",
    label: "Título de familia",
    kind: "text",
    staticText: "PROGRAMACIÓN",
    x: 6.5, y: 4, align: "left", maxW: 60,
    fontFamily: "bebas", fontSize: 96, lineHeight: 0.88,
    color: "family", uppercase: true,
  },
  {
    id: "dateBox",
    label: "Caja de fecha",
    kind: "date-box",
    x: 84, y: 5, align: "left",
    fontFamily: "bebas", fontSize: 110, lineHeight: 0.82,
    color: "white", background: "family",
    monthScale: 0.27, padding: 16,
  },
  {
    id: "titulo",
    label: "Espectáculo",
    kind: "text",
    bind: "titulo",
    x: 50, y: 70, align: "center", maxW: 88,
    fontFamily: "bebas", fontSize: 76, lineHeight: 0.95,
    color: "white", uppercase: true, quote: true,
  },
  {
    id: "hora",
    label: "Hora",
    kind: "text",
    bind: "hora",
    x: 50, y: 80, align: "center", maxW: 88,
    fontFamily: "bebas", fontSize: 36, letterSpacing: "0.08em",
    color: "white", uppercase: true,
  },
  {
    id: "publico",
    label: "Público",
    kind: "text",
    bind: "publico",
    x: 50, y: 83.5, align: "center", maxW: 88,
    fontFamily: "dm", fontSize: 22, letterSpacing: "0.18em", lineHeight: 1.3, weight: 500,
    color: "white", uppercase: true,
  },
  {
    id: "cta",
    label: "CTA",
    kind: "cta",
    bind: "cta",
    x: 50, y: 90, align: "center",
    fontFamily: "bebas", fontSize: 36, letterSpacing: "0.1em",
    color: "white", background: "family", uppercase: true, padding: 20,
  },
];

const tplBase = (id: string, label: string, description: string, defaults: FieldValues, fields: any[]) => ({
  id, label, description, requiresPhoto: true, defaultValues: defaults, fields, presets: PRESETS, blocks,
});

export const programacion: FamilyDefinition = {
  id: "programacion",
  label: "PROGRAMACIÓN",
  color: "#B5451E",
  colorDark: "#7E2F12",
  textOnColor: "#FFFFFF",
  templates: [
    tplBase("funcion", "Función", "Anuncio principal con fecha, hora y CTA.", baseDefaults, [
      { id: "dia", label: "Día", type: "text", maxLength: 2, required: true, placeholder: "14" },
      { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true, placeholder: "JUNIO" },
      { id: "titulo", label: "Espectáculo", type: "text", maxLength: 40, required: true },
      { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true },
      { id: "publico", label: "Público", type: "text", maxLength: 30, options: PUBLICO_OPTIONS },
      { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true },
    ]),
    tplBase("teaser", "Teaser / próximamente",
      "Aviso anticipado.",
      { ...baseDefaults, titulo: "PRÓXIMAMENTE", hora: "UNA NUEVA OBRA", publico: "", cta: "MÁS INFO PRONTO" },
      [
        { id: "dia", label: "Día", type: "text", maxLength: 2 },
        { id: "mes", label: "Mes", type: "text", maxLength: 12 },
        { id: "titulo", label: "Título", type: "text", maxLength: 40, required: true },
        { id: "hora", label: "Subtítulo", type: "text", maxLength: 30 },
        { id: "publico", label: "Nota", type: "text", maxLength: 30 },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true },
      ]),
    tplBase("ultima", "Última función", "Urgencia.",
      { ...baseDefaults, cta: "ÚLTIMAS ENTRADAS" },
      [
        { id: "dia", label: "Día", type: "text", maxLength: 2, required: true },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true },
        { id: "titulo", label: "Espectáculo", type: "text", maxLength: 40, required: true },
        { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true },
        { id: "publico", label: "Público", type: "text", maxLength: 30, options: PUBLICO_OPTIONS },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true },
      ]),
    tplBase("entradas", "Entradas a la venta", "Apertura de venta.",
      { ...baseDefaults, cta: "ENTRADAS A LA VENTA" },
      [
        { id: "dia", label: "Día", type: "text", maxLength: 2, required: true },
        { id: "mes", label: "Mes", type: "text", maxLength: 12, required: true },
        { id: "titulo", label: "Espectáculo", type: "text", maxLength: 40, required: true },
        { id: "hora", label: "Hora", type: "text", maxLength: 20, required: true },
        { id: "publico", label: "Público", type: "text", maxLength: 30, options: PUBLICO_OPTIONS },
        { id: "cta", label: "CTA", type: "text", maxLength: 30, required: true },
      ]),
  ],
};
